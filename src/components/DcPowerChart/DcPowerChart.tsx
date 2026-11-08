"use client";

import { useId, useState, type KeyboardEvent, type PointerEvent } from "react";
import { AxisBottom, AxisLeft, type TickRendererProps } from "@visx/axis";
import { Group } from "@visx/group";
import { scaleLinear } from "@visx/scale";
import { Bar, Line, LinePath } from "@visx/shape";
import type {
  DcPowerChartSeries,
  PowerAtSocSample,
} from "@/application/dcPowerChartSeries";
import {
  describeInspectedPoint,
  inspectedPoint,
  inspectedSocAt,
  inspectionKeyTarget,
  type InspectedPoint,
} from "@/presentation/chartInspection";
import { formatPowerKw, formatSocPercent } from "@/presentation/format";
import styles from "./DcPowerChart.module.css";

// Drawing geometry (px of the 1440 px layout). The SVG scales with its container.
const WIDTH = 960;
const HEIGHT = 300;
const MARGIN = { top: 28, right: 8, bottom: 40, left: 48 };
const PLOT_WIDTH = WIDTH - MARGIN.left - MARGIN.right;
const PLOT_HEIGHT = HEIGHT - MARGIN.top - MARGIN.bottom;
const POWER_TICK_KW = 50;
const SOC_TICKS = [0, 20, 40, 60, 80, 100];
const MARKER_RADIUS = 4.5;

/**
 * Zero-based power scale with headroom above the highest value drawn (curve point or station
 * limit), in whole 50 kW steps, so that the hatched region above the station limit stays visible.
 */
function powerDomainMaxKw(series: DcPowerChartSeries): number {
  const highest = Math.max(
    series.stationMaxPowerKw,
    ...series.declaredPoints.map((point) => point.powerKw),
  );
  return (Math.floor(highest / POWER_TICK_KW) + 1) * POWER_TICK_KW;
}

const socOf = (sample: PowerAtSocSample) => sample.socPercent;
const powerOf = (sample: PowerAtSocSample) => sample.powerKw;

function PowerTick({ x, y, formattedValue }: TickRendererProps) {
  return (
    <text x={x} y={y} dy="0.32em" textAnchor="end" className={styles.tick}>
      {formattedValue}
    </text>
  );
}

function SocTick({ x, y, formattedValue }: TickRendererProps) {
  return (
    <text x={x} y={y} dy="1.1em" textAnchor="middle" className={styles.tick}>
      {formattedValue}
    </text>
  );
}

type DcPowerChartProps = {
  series: DcPowerChartSeries;
  /** Vehicle name, for the text equivalent. */
  vehicleName: string;
  /**
   * Adds the inspection of a point (DC simulation): pointer or keyboard selects a SoC, and the
   * chart shows the vehicle curve and the power received there, as text too. Off in the compact
   * Ricarica preview.
   */
  inspectable?: boolean;
};

const TOOLTIP_WIDTH = 190;
const TOOLTIP_HEIGHT = 62;

/** The plot area as percentages of the drawing, so an HTML layer can sit exactly on it. */
const PLOT_BOX = {
  left: `${(MARGIN.left / WIDTH) * 100}%`,
  top: `${(MARGIN.top / HEIGHT) * 100}%`,
  width: `${(PLOT_WIDTH / WIDTH) * 100}%`,
  height: `${(PLOT_HEIGHT / HEIGHT) * 100}%`,
};

/**
 * Power by state of charge at a DC station (Livrea Consolidated, 04-charging.svg), for a vehicle
 * outside the comparison: neutral ink, never a slot colour.
 *
 * - Vehicle curve: dotted, with the declared points as circles (linear interpolation between them).
 * - Power received: solid; the engine's effective DC power, received already computed.
 * - Station limit: ink dashed line with a yellow plate, hatched region above it.
 * - Scenario interval: yellow bar on the SoC axis and a pale band.
 *
 * Every value drawn arrives in `series`; the chart computes no power.
 */
export function DcPowerChart({
  series,
  vehicleName,
  inspectable = false,
}: DcPowerChartProps) {
  const hatchId = `hatch-${useId().replace(/:/g, "")}`;
  // Transient interaction state: local, not restored after navigation (ADR 0001, Decision 4).
  const [inspectedSoc, setInspectedSoc] = useState<number | undefined>();
  const [inspectionFocused, setInspectionFocused] = useState(false);
  const domainMaxKw = powerDomainMaxKw(series);
  const socScale = scaleLinear<number>({
    domain: [0, 100],
    range: [0, PLOT_WIDTH],
  });
  const powerScale = scaleLinear<number>({
    domain: [0, domainMaxKw],
    range: [PLOT_HEIGHT, 0],
  });
  const powerTicks = Array.from(
    { length: domainMaxKw / POWER_TICK_KW + 1 },
    (_, index) => index * POWER_TICK_KW,
  );

  const { fromSocPercent, toSocPercent } = series.interval;
  const intervalX0 = socScale(fromSocPercent);
  const intervalX1 = socScale(toSocPercent);
  const stationY = powerScale(series.stationMaxPowerKw);
  const stationLabel = `colonnina ${formatPowerKw(series.stationMaxPowerKw)}`;
  const stationPlateWidth = stationLabel.length * 6.7 + 16;
  const intervalLabel = `intervallo ${fromSocPercent} → ${formatSocPercent(toSocPercent)}`;
  const emptyInterval = fromSocPercent === toSocPercent;
  // Keep the interval label inside the plot when the interval is near an edge.
  const intervalLabelX = Math.min(
    PLOT_WIDTH - 60,
    Math.max(60, (intervalX0 + intervalX1) / 2),
  );

  const inspected =
    inspectable && inspectedSoc !== undefined
      ? inspectedPoint(series, inspectedSoc)
      : undefined;

  function inspectAtPointer(event: PointerEvent<HTMLDivElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    if (box.width === 0) return;
    setInspectedSoc(inspectedSocAt((event.clientX - box.left) / box.width));
  }

  function inspectWithKeyboard(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      setInspectedSoc(undefined);
      return;
    }
    const target = inspectionKeyTarget(
      event.key,
      inspectedSoc ?? fromSocPercent,
      event.shiftKey,
    );
    if (target !== undefined) {
      event.preventDefault();
      setInspectedSoc(target);
    }
  }

  const receivedAt = new Map(
    series.effectivePower.map((sample) => [sample.socPercent, sample.powerKw]),
  );

  return (
    <figure className={styles.figure}>
      <div className={styles.plotArea}>
        <svg
          className={styles.svg}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-label={`Grafico della potenza di ricarica di ${vehicleName} per livello di carica, con ${stationLabel} e ${intervalLabel}. I valori sono nella tabella che segue.`}
        >
          <defs>
            <pattern
              id={hatchId}
              width="7"
              height="7"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <line x1="0" y1="0" x2="0" y2="7" className={styles.hatchLine} />
            </pattern>
          </defs>

          <Group left={MARGIN.left} top={MARGIN.top}>
            {/* Scenario interval: pale band (yellow intensity B, tier 2). */}
            <Bar
              x={intervalX0}
              y={0}
              width={Math.max(0, intervalX1 - intervalX0)}
              height={PLOT_HEIGHT}
              className={styles.intervalBand}
            />

            {/* Above the station's power: hatched, labelled. */}
            <Bar
              x={0}
              y={0}
              width={PLOT_WIDTH}
              height={Math.max(0, stationY)}
              fill={`url(#${hatchId})`}
            />
            <text x={8} y={16} className={styles.regionLabel}>
              oltre la potenza della colonnina
            </text>

            {powerTicks.map((kw) => (
              <Line
                key={kw}
                from={{ x: 0, y: powerScale(kw) }}
                to={{ x: PLOT_WIDTH, y: powerScale(kw) }}
                className={styles.gridLine}
              />
            ))}

            <AxisLeft
              scale={powerScale}
              tickValues={powerTicks}
              tickFormat={(value) => String(value)}
              hideAxisLine
              hideTicks
              tickLength={12}
              tickComponent={PowerTick}
            />
            <text x={-12} y={-14} textAnchor="end" className={styles.unit}>
              kW
            </text>

            <AxisBottom
              top={PLOT_HEIGHT}
              scale={socScale}
              tickValues={SOC_TICKS}
              tickFormat={(value) => formatSocPercent(Number(value))}
              hideTicks
              tickLength={10}
              axisLineClassName={styles.axisLine}
              tickComponent={SocTick}
            />

            {/* Scenario interval on the SoC axis: yellow bar with ink ends. */}
            <Bar
              x={intervalX0}
              y={PLOT_HEIGHT - 3}
              width={Math.max(0, intervalX1 - intervalX0)}
              height={6}
              rx={3}
              className={styles.intervalBar}
            />
            {[intervalX0, intervalX1].map((x, index) => (
              <Line
                key={index}
                from={{ x, y: PLOT_HEIGHT - 7 }}
                to={{ x, y: PLOT_HEIGHT + 7 }}
                className={styles.intervalEnd}
              />
            ))}
            {/* An empty interval (initial = final SoC) still marks the chosen SoC. */}
            {emptyInterval ? (
              <circle
                cx={intervalX0}
                cy={PLOT_HEIGHT}
                r={5}
                className={styles.intervalPoint}
              />
            ) : null}
            <text
              x={intervalLabelX}
              y={PLOT_HEIGHT - 12}
              textAnchor="middle"
              className={styles.intervalLabel}
            >
              {intervalLabel}
            </text>

            {/* Vehicle curve, then the power received over it. */}
            <LinePath
              data={[...series.vehicleCurve]}
              x={(sample) => socScale(socOf(sample))}
              y={(sample) => powerScale(powerOf(sample))}
              className={styles.vehicleCurve}
            />
            <LinePath
              data={[...series.effectivePower]}
              x={(sample) => socScale(socOf(sample))}
              y={(sample) => powerScale(powerOf(sample))}
              className={styles.received}
            />

            {/* Station limit: ink dashed line with a yellow plate. */}
            <Line
              from={{ x: 0, y: stationY }}
              to={{ x: PLOT_WIDTH, y: stationY }}
              className={styles.stationLine}
            />
            <g
              transform={`translate(${PLOT_WIDTH - stationPlateWidth}, ${stationY - 28})`}
            >
              <rect
                width={stationPlateWidth}
                height={22}
                rx={6}
                className={styles.stationPlate}
              />
              <text
                x={stationPlateWidth / 2}
                y={15}
                textAnchor="middle"
                className={styles.stationLabel}
              >
                {stationLabel}
              </text>
            </g>

            {series.declaredPoints.map((point) => (
              <circle
                key={point.socPercent}
                cx={socScale(point.socPercent)}
                cy={powerScale(point.powerKw)}
                r={MARKER_RADIUS}
                className={styles.declaredPoint}
              />
            ))}

            {inspected !== undefined ? (
              <InspectionMarks
                point={inspected}
                x={socScale(inspected.socPercent)}
                curveY={powerScale(inspected.vehicleCurveKw)}
                receivedY={powerScale(inspected.receivedKw)}
              />
            ) : null}
          </Group>
        </svg>

        {inspectable ? (
          <div
            className={styles.inspection}
            style={PLOT_BOX}
            role="slider"
            tabIndex={0}
            aria-label={`Ispeziona il grafico: potenza per livello di carica di ${vehicleName}`}
            aria-orientation="horizontal"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={inspected?.socPercent ?? fromSocPercent}
            aria-valuetext={
              inspected === undefined
                ? formatSocPercent(fromSocPercent)
                : describeInspectedPoint(inspected)
            }
            onPointerMove={inspectAtPointer}
            onPointerDown={inspectAtPointer}
            onPointerLeave={() => {
              if (!inspectionFocused) setInspectedSoc(undefined);
            }}
            onFocus={() => {
              setInspectionFocused(true);
              setInspectedSoc((soc) => soc ?? fromSocPercent);
            }}
            onBlur={() => {
              setInspectionFocused(false);
              setInspectedSoc(undefined);
            }}
            onKeyDown={inspectWithKeyboard}
          />
        ) : null}
      </div>

      <figcaption className={styles.legend}>
        <ul className={styles.legendList}>
          <li className={styles.legendItem}>
            <svg
              className={styles.swatch}
              viewBox="0 0 24 10"
              aria-hidden="true"
            >
              <line x1="1" y1="5" x2="23" y2="5" className={styles.received} />
            </svg>
            Potenza ricevuta
          </li>
          <li className={styles.legendItem}>
            <svg
              className={styles.swatch}
              viewBox="0 0 24 10"
              aria-hidden="true"
            >
              <line
                x1="1"
                y1="5"
                x2="23"
                y2="5"
                className={styles.vehicleCurve}
              />
            </svg>
            Curva del veicolo
          </li>
          <li className={styles.legendItem}>
            <svg
              className={styles.swatchPoint}
              viewBox="0 0 12 12"
              aria-hidden="true"
            >
              <circle
                cx="6"
                cy="6"
                r={MARKER_RADIUS - 0.5}
                className={styles.declaredPoint}
              />
            </svg>
            punto dichiarato dal costruttore (illustrativo) · tra i punti:
            interpolazione lineare
          </li>
        </ul>
      </figcaption>

      {/* The caption lives in the table wrapper box, outside the box that
          clipping applies to on a <table>: hide a block container instead. */}
      <div className="visually-hidden">
        <table>
          <caption>
            Potenza di ricarica di {vehicleName} ai punti dichiarati, con{" "}
            {stationLabel}
          </caption>
          <thead>
            <tr>
              <th scope="col">Livello di carica</th>
              <th scope="col">Curva del veicolo</th>
              <th scope="col">Potenza ricevuta</th>
            </tr>
          </thead>
          <tbody>
            {series.declaredPoints.map((point) => {
              const received = receivedAt.get(point.socPercent);
              return (
                <tr key={point.socPercent}>
                  <th scope="row">{formatSocPercent(point.socPercent)}</th>
                  <td>{formatPowerKw(point.powerKw)}</td>
                  <td>
                    {received === undefined ? "—" : formatPowerKw(received)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

/** Crosshair, points and tooltip of the inspected SoC: neutral, as in 04-charging.svg. */
function InspectionMarks({
  point,
  x,
  curveY,
  receivedY,
}: {
  point: InspectedPoint;
  x: number;
  curveY: number;
  receivedY: number;
}) {
  const onLeft = x + 12 + TOOLTIP_WIDTH > PLOT_WIDTH;
  const tooltipX = onLeft ? x - 12 - TOOLTIP_WIDTH : x + 12;
  const tooltipY = Math.min(
    PLOT_HEIGHT - TOOLTIP_HEIGHT - 20,
    Math.max(0, receivedY - TOOLTIP_HEIGHT / 2),
  );

  return (
    <g aria-hidden="true" pointerEvents="none">
      <Line
        from={{ x, y: 0 }}
        to={{ x, y: PLOT_HEIGHT }}
        className={styles.crosshair}
      />
      {curveY !== receivedY ? (
        <circle cx={x} cy={curveY} r={3.5} className={styles.inspectedCurve} />
      ) : null}
      <circle
        cx={x}
        cy={receivedY}
        r={4}
        className={styles.inspectedReceived}
      />
      <g transform={`translate(${tooltipX}, ${tooltipY})`}>
        <rect
          width={TOOLTIP_WIDTH}
          height={TOOLTIP_HEIGHT}
          rx={8}
          className={styles.tooltip}
        />
        <text x={12} y={19} className={styles.tooltipTitle}>
          {formatSocPercent(point.socPercent)}
        </text>
        <text x={12} y={36} className={styles.tooltipText}>
          Potenza ricevuta
        </text>
        <text
          x={TOOLTIP_WIDTH - 12}
          y={36}
          textAnchor="end"
          className={styles.tooltipValue}
        >
          {formatPowerKw(point.receivedKw)}
        </text>
        <text x={12} y={52} className={styles.tooltipText}>
          Curva del veicolo
        </text>
        <text
          x={TOOLTIP_WIDTH - 12}
          y={52}
          textAnchor="end"
          className={styles.tooltipValue}
        >
          {formatPowerKw(point.vehicleCurveKw)}
        </text>
      </g>
    </g>
  );
}
