export function ErrorBanner({ message }: { message: string | null }): JSX.Element | null {
  if (!message) return null;
  return <div className="errorBanner">{message}</div>;
}
