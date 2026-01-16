// Definição da interface para as propriedades do botão
interface ButtonRifaProps {
  label?: string; // Propriedade opcional para o texto do botão
  onClickSelect: () => void; // Propriedade obrigatória para a função de clique
  className?: string; // Propriedade opcional para adicionar classes CSS
  selected?: boolean;
  sold?: boolean;
  reservation?: boolean;
}

// Componente ButtonRifa utilizando a interface diretamente
const ButtonRifa = ({
  label,
  onClickSelect,
  className = "",
  selected = false,
  sold = false,
  reservation = false,
}: ButtonRifaProps) => {
  const isDisabled = sold || reservation ;

  return (
    <button
      type="button"
      onClick={isDisabled ? undefined : onClickSelect}
      disabled={isDisabled}
      className={`py-2 px-4 rounded border ${
        reservation
          ? "bg-green-500 text-white cursor-not-allowed"
          : isDisabled
            ? "bg-gray-500 text-gray-200 cursor-not-allowed"
            : selected
              ? "bg-blue-500 text-white"
              : "bg-white text-black"
      } ${className}`}
    >
      {label}
    </button>
  );
};

export default ButtonRifa;
