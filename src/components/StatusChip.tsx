interface StatusChipProps {
  label: string;
  done?: boolean;
}

export function StatusChip({ label, done }: StatusChipProps): JSX.Element {
  return <span className={`chip ${done ? 'chipDone' : 'chipPending'}`}>{label}</span>;
}
