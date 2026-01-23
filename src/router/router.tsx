import BottomNavBar from "@/components/navBar";
import Home from "@/pages/home";
import Login from "@/pages/login/login";
import UserForm from "@/pages/user/userForm";
import Rifa from "@/pages/rifa/rifa";
import RifaForm from "@/pages/rifa/rifaForm";
import RifaList from "@/pages/rifa/rifaList";
import {
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation,
} from "react-router-dom";
import Painel from "@/pages/painel/painel";

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        {/* Painel pós-login */}
        <Route path="/panel" element={<Painel />} />

        {/* <Route path="/table" element={<ListaPessoa />} /> */}

        {/* Pessoa: form sempre em /pessoa/form/:formType/:userId? */}
        <Route path="/user/form/:formType/:userId?" element={<UserForm />} />

        {/* Rifa: detalhe separado do form */}
        <Route path="/raffle/:raffleId/:cpf?" element={<Rifa />} />
        <Route
          path="/raffle/form/:formType/:raffleId?"
          element={<RifaForm />}
        />

        {/* Lista (recomendado: cpf via querystring /rifas?cpf=...) */}
        <Route path="/raffles/:cpf?" element={<RifaList />} />
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
