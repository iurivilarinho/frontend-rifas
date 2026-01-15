import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  TableRowWihtButton,
} from "@/components/ui/table";
import { useEffect, useState } from "react";

import { Pagination } from "@/components/ui/pagination";

import { useGetPessoa } from "@/lib/api/tanstackQuery/pessoa";
import { Pessoa } from "@/types/pessoa";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/button/button";
import { useCustomDialogContext } from "@/components/dialog/useCustomDialogContext";

export function ListaPessoa() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data, isLoading, error } = useGetPessoa();

  const { setCustomDialog } = useCustomDialogContext();

  const navigate = useNavigate();

  const handleButtonClickVisualize = (pessoa: Pessoa) => {
    navigate(`/pessoa/visualizar/${pessoa.id}`)
  };


  const handleButtonClickUpdate = (pessoa: Pessoa) => {
    navigate(`/pessoa/editar/${pessoa.id}`)
  };

  const handleButtonClickInsert = () => {
    navigate("/pessoa/")
  };

  useEffect(() => {
    if (error) {
      setCustomDialog({
        message: "Erro ao carregar os dados.",
        title: "Erro",
        type: "error",
        closeHandler: () => setCustomDialog({}),
      })
    }
  }, [error])

  // Paginação dos dados
  const totalPages = Math.ceil(data?.length / itemsPerPage);
  const startIndex = Math.max(currentPage - 1, 1) * itemsPerPage;
  const paginatedData = data?.slice(startIndex, startIndex + itemsPerPage);



  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="w-16 h-16 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>

    </div>
    // Exibe uma mensagem de carregamento
  }

  if (!data || data.length === 0) {
    return <div>Nenhuma pessoa encontrada.</div> // Exibe uma mensagem caso não haja dados
  }

  return (
    <div className="flex h-full justify-center w-full p-10">
      <div className="w-4/5">
        <Table className="bg-slate-50">
          <TableCaption>A list of your recent invoices.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="">Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead className="">Data Nascimento</TableHead>
              <TableHead>Placa Veiculo</TableHead>
              <div className="flex items-center justify-center h-10"> <Button onClick={handleButtonClickInsert} size={"sm"}>
                Adiconar
              </Button></div>

            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((pessoa: Pessoa) => (
              <TableRowWihtButton
                key={pessoa.id}
                onClickVisualize={() => handleButtonClickVisualize(pessoa)}
                onClickUpdate={() => handleButtonClickUpdate(pessoa)}
              >
                <TableCell className="font-medium">
                  {pessoa.nome}
                </TableCell>
                <TableCell>{pessoa.email}</TableCell>
                <TableCell>{pessoa.telefoneCelular}</TableCell>
                <TableCell className="">{pessoa.dataNascimento}</TableCell>
                <TableCell>
                  {pessoa.informacaoSeguranca?.placaVeiculo || "N/A"}
                </TableCell>
              </TableRowWihtButton>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={5}>
                <div className="flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  ></Pagination>
                </div>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  );
}
