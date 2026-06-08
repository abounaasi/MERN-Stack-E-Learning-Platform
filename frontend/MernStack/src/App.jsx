import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home/Home";
import Header from "./components/header/Header";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Verify from "./pages/auth/Verify";
import Footer from "./components/footer/Footer";
import About from "./pages/about/About";
import Account from "./pages/account/Account";
import { UserData } from "./context/UserContext";
import Courses from "./pages/courses/Courses";
import Loading from "./components/loading/Loading";
import CourseDescription from "./pages/coursedescription/CourseDescription";
import Dashboard from "./pages/dashboard/Dashboard";
import Coursestudy from "./pages/coursestudy/Coursestudy";
import Lecture from "./pages/lecture/Lecture";
import AdminDashboard from "./admin/Dashboard/AdminDashboard";
import AdminUsers from "./admin/Users/AdminUsers";
import InstructorDashboard from "./instructor/Dashboard/InstructorDashboard";
import InstructorCourses from "./instructor/Courses/InstructorCourses";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Certificate from "./pages/certificate/Certificate";
import StudyGroups from "./pages/groups/StudyGroups";
import StudyGroupRoom from "./pages/groups/StudyGroupRoom";

const App = () => {
  const { isAuth, user, loading } = UserData();
  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/certificate/:id" element={<Certificate />} />
            <Route
              path="/account"
              element={isAuth ? <Account user={user} /> : <Login />}
            />
            <Route path="/login" element={isAuth ? <Home /> : <Login />} />
            <Route
              path="/register"
              element={isAuth ? <Home /> : <Register />}
            />
            <Route path="/verify" element={isAuth ? <Home /> : <Verify />} />
            <Route
              path="/forgot"
              element={isAuth ? <Home /> : <ForgotPassword />}
            />
            <Route
              path="/reset-password/:token"
              element={isAuth ? <Home /> : <ResetPassword />}
            />
            <Route
              path="/course/:id"
              element={isAuth ? <CourseDescription user={user} /> : <Login />}
            />
            <Route
              path="/:id/dashboard"
              element={isAuth ? <Dashboard user={user} /> : <Login />}
            />
            <Route
              path="/course/study/:id"
              element={isAuth ? <Coursestudy user={user} /> : <Login />}
            />
            <Route
              path="/lectures/:id"
              element={isAuth ? <Lecture user={user} /> : <Login />}
            />
            <Route
              path="/groups"
              element={isAuth ? <StudyGroups /> : <Login />}
            />
            <Route
              path="/group/:id"
              element={isAuth ? <StudyGroupRoom /> : <Login />}
            />
            <Route
              path="/admin/dashboard"
              element={isAuth ? <AdminDashboard user={user} /> : <Login />}
            />
            <Route
              path="/admin/users"
              element={isAuth ? <AdminUsers user={user} /> : <Login />}
            />
            <Route
              path="/instructor/dashboard"
              element={isAuth ? <InstructorDashboard user={user} /> : <Login />}
            />
            <Route
              path="/instructor/courses"
              element={isAuth ? <InstructorCourses user={user} /> : <Login />}
            />
          </Routes>

          <Footer />
        </BrowserRouter>
      )}
    </>
  );
};

export default App;
