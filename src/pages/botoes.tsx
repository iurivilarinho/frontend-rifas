// import React, { useState } from "react";

// interface HeartProps {
//   x: number;
//   y: number;
//   size: number;
// }

// const Botoes: React.FC = () => {
//   const [noButtonPosition, setNoButtonPosition] = useState<{ top: number; left: number }>({ top: 40, left: 42 });
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [hearts, setHearts] = useState<HeartProps[]>([]);

//   const handleNoMove = () => {
//     const newTop = Math.floor(Math.random() * 60) + 20;
//     const newLeft = Math.floor(Math.random() * 60) + 20;

//     setNoButtonPosition({ top: newTop, left: newLeft });
//   };

//   const handleSimClick = () => {
//     setIsModalOpen(true);

//     // Gera 10 corações em posições e tamanhos aleatórios pela tela
//     const newHearts = Array.from({ length: 10 }).map(() => ({
//       x: Math.floor(Math.random() * window.innerWidth), // largura da tela
//       y: Math.floor(Math.random() * window.innerHeight), // altura da tela
//       size: Math.random() * 30 + 10, // tamanho aleatório entre 10px e 40px
//     }));
//     setHearts([...hearts, ...newHearts]);

//     setTimeout(() => {
//       setHearts([]);
//     }, 4000); // Aumentado para 4 segundos
//   };

//   const closeModal = () => {
//     setIsModalOpen(false);
//   };

//   return (
//     <div className="relative flex flex-col items-center justify-center h-screen">
//       <p className="mb-8 text-xl">Bora sair Hoje?</p>
//       <button
//         onClick={handleSimClick}
//         className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
//       >
//         Sim
//       </button>
//       <button
//         onMouseEnter={handleNoMove}
//         onClick={handleNoMove}
//         className="px-4 py-2 bg-red-500 text-white rounded absolute transition-all duration-200"
//         style={{
//           top: `${noButtonPosition.top}%`,
//           left: `${noButtonPosition.left}%`,
//         }}
//       >
//         Não
//       </button>

//       {hearts.map((heart, index) => (
//         <div
//           key={index}
//           className="absolute text-red-500"
//           style={{
//             left: `${heart.x}px`,
//             top: `${heart.y}px`,
//             fontSize: `${heart.size}px`,
//             animation: "floatUp 4s ease-in-out forwards, pulse 2s infinite", // Animação aumentada para 4 segundos
//             zIndex: 1000, // Corações na frente do diálogo
//           }}
//         >
//           ❤️
//         </div>
//       ))}

//       {isModalOpen && (
//         <div className="fixed inset-0 flex items-center justify-center z-40 bg-black bg-opacity-50">
//           <div className="bg-white p-6 rounded shadow-lg">
//             <h2 className="text-lg font-semibold mb-4">Mensagem</h2>
//             <p className="mb-4">Partiu ponte do tijuco! Prometo não te jogar de lá :)</p>
//             <p>Que seu estresse de hoje seja do seu tamanho❣️</p>
//             <button
//               onClick={closeModal}
//               className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
//             >
//               Fechar
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Estilo embutido para animação */}
//       <style>{`
//         @keyframes floatUp {
//           0% {
//             transform: translateY(0);
//             opacity: 1;
//           }
//           100% {
//             transform: translateY(-100px);
//             opacity: 0;
//           }
//         }

//         @keyframes pulse {
//           0% {
//             transform: scale(1);
//           }
//           50% {
//             transform: scale(1.2);
//           }
//           100% {
//             transform: scale(1);
//           }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default Botoes;
