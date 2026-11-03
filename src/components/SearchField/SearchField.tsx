import { useId, type Ref } from "react";
import styles from "./SearchField.module.css";

type SearchFieldProps = {
  value: string;
  onValueChange: (value: string) => void;
  /** Accessible name; also the placeholder. */
  label: string;
  maxLength?: number;
  ref?: Ref<HTMLInputElement>;
};

/**
 * Direct search field. Results follow the value while typing, so there is no submit step:
 * pressing Enter does nothing beyond keeping the focus in the field.
 */
export function SearchField({
  value,
  onValueChange,
  label,
  maxLength,
  ref,
}: SearchFieldProps) {
  const id = useId();

  return (
    <form
      role="search"
      className={styles.field}
      onSubmit={(event) => event.preventDefault()}
    >
      <label htmlFor={id} className="visually-hidden">
        {label}
      </label>
      <svg
        className={styles.icon}
        viewBox="0 0 16 16"
        aria-hidden="true"
        focusable="false"
      >
        <circle cx="7" cy="7" r="6" />
        <path d="M11.5 11.5 15 15" />
      </svg>
      <input
        ref={ref}
        id={id}
        className={styles.input}
        type="search"
        value={value}
        placeholder={label}
        maxLength={maxLength}
        autoComplete="off"
        spellCheck={false}
        enterKeyHint="search"
        onChange={(event) => onValueChange(event.target.value)}
      />
    </form>
  );
}
