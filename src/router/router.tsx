import BottomNavBar from "@/components/navBar";
import Home from "@/pages/home";
import Login from "@/pages/login/login";
import UserForm from "@/pages/user/userForm";
import { ListaPessoa } from "@/pages/user/pessoaLista";
import Rifa from "@/pages/rifa/rifa";
import RifaForm from "@/pages/rifa/rifaForm";
import RifaList from "@/pages/rifa/rifaList";
import {
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation,
} from "react-router-dom";

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/table" element={<ListaPessoa />} />

        {/* Pessoa: form sempre em /pessoa/form/:formType/:userId? */}
        <Route path="/pessoa/form/:formType/:userId?" element={<UserForm />} />

        {/* Rifa: detalhe separado do form */}
        <Route path="/rifa/:rifaId" element={<Rifa />} />
        <Route path="/rifa/form/:formType/:rifaId?" element={<RifaForm />} />

        {/* Lista (recomendado: cpf via querystring /rifas?cpf=...) */}
        <Route path="/rifas" element={<RifaList />} />
      </Routes>

      <NavBarWrapper />
    </Router>
  );
};

const NavBarWrapper = () => {
  const location = useLocation();
  const noNavBarRoutes = ["/login"]; // "/index" não existe
  return !noNavBarRoutes.includes(location.pathname) ? <BottomNavBar /> : null;
};

export default AppRouter;
