type Props = {
  message: string;
  key: number;
};
export default function Message({ message, key }: Props) {
  return (
    <div className="place-self-end">
      <div key={key} className="bg-slate-50 p-5 rounded-lg">
        {message}
      </div>
    </div>
  );
}
