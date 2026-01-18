interface BarraProgressoProps {
  porcentagem: number;
  label: string;
}

const BarraProgresso = ({ label, porcentagem }: BarraProgressoProps) => {
  return (
    <div className="w-full">
      <p className="font-bold">{label}</p>
      <div className="w-full bg-gray-300 rounded-full h-6 overflow-hidden">
        <div
          className="bg-green-500 h-full rounded-full transition-all duration-500"
          style={{ width: `${porcentagem}%` }}
        ></div>
      </div>
    </div>
  );
};

export default BarraProgresso;
