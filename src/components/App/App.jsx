import React, { useEffect } from 'react';
import { HashRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Nav from '../Nav/Nav';
import Footer from '../Footer/Footer';
import ProtectedRoute from '../ProtectedRoute/ProtectedRoute';
import AboutPage from '../AboutPage/AboutPage';
import UserPage from '../UserPage/UserPage';
import ContactPage from '../ContactPage/ContactPage';
import LandingPage from '../LandingPage/LandingPage';
import LoginPage from '../LoginPage/LoginPage';
import RegisterPage from '../RegisterPage/RegisterPage';
import MenuPage from '../MenuPage/MenuPage';
import OrderPage from '../OrderPage/OrderPage';
import CheckoutPage from '../CheckoutPage/CheckoutPage';
import OrderPlacedPage from '../OrderPlacedPage/OrderPlacedPage';
import Admin from '../Admin/Admin';
import './App.css';


function App() {
  const dispatch = useDispatch();
  const user = useSelector((store) => store.user);

  useEffect(() => {
    dispatch({ type: "FETCH_USER" });
  }, [dispatch]);

  return (
    <Router>
      <div>
        <Nav />
        <Switch>
          {/* Visiting localhost:5173 will redirect to localhost:5173/home */}
          <Redirect exact from="/" to="/home" />

          {/* For protected routes, the view could show one of several things on the same route.
            Visiting localhost:5173/user will show the UserPage if the user is logged in.
            If the user is not logged in, the ProtectedRoute will show the LoginPage (component).
            Even though it seems like they are different pages, the user is always on localhost:5173/user */}
          <ProtectedRoute
            exact
            path="/user"
          >
            <UserPage />
          </ProtectedRoute>

          <ProtectedRoute exact path="/order">
            <OrderPage />
          </ProtectedRoute>

          <ProtectedRoute exact path="/admin">
            <Admin />
          </ProtectedRoute>

          <Route
            exact
            path="/contact"
          >
            <ContactPage />
          </Route>

          <Route exact path="/about">
            <AboutPage />
          </Route>

          <Route exact path="/menu">
            <MenuPage />
          </Route>

          <Route exact path="/order">
            <OrderPage />
          </Route>

          <Route exact path="/checkout">
            <CheckoutPage />
          </Route>

          <Route exact path="/checkout-success">
            <OrderPlacedPage />
          </Route>

          <Route exact path="/login">
            {user.id ? (
              <Redirect to="/user" />
            ) : (
              <LoginPage />
            )}
          </Route>

          <Route exact path="/registration">
            {user.id ? (
              <Redirect to="/user" />
            ) : (
              <RegisterPage />
            )}
          </Route>

          <Route exact path="/home">
            <LandingPage />
          </Route>

          {/* If none of the other routes matched, we will show a 404. */}
          <Route>
            <h1>404</h1>
          </Route>
        </Switch>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
