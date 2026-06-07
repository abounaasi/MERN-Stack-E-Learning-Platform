import React, { useEffect, useState } from "react";
import Layout from "../../admin/Utils/Layout";
import { useNavigate } from "react-router-dom";
import { CourseData } from "../../context/CourseContext";
import CourseCard from "../../components/coursecard/CourseCard";
import "./instructorcourses.css";
import toast from "react-hot-toast";
import axios from "axios";
import { server } from "../../main";

const categories = [
  "Web Development",
  "App Development",
  "Game Development",
  "Data Science",
  "Artificial Intelligence",
];

const InstructorCourses = ({ user }) => {
  const navigate = useNavigate();

  if (user && user.role !== "instructor") return navigate("/");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [image, setImage] = useState("");
  const [imagePrev, setImagePrev] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);
  const [myCourses, setMyCourses] = useState([]);

  const { fetchCourses } = CourseData();

  async function fetchInstructorCourses() {
    try {
      const { data } = await axios.get(`${server}/api/instructor/courses`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });

      setMyCourses(data.courses);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchInstructorCourses();
  }, []);

  const changeImageHandler = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onloadend = () => {
      setImagePrev(reader.result);
      setImage(file);
    };
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setBtnLoading(true);

    const myForm = new FormData();

    myForm.append("title", title);
    myForm.append("description", description);
    myForm.append("category", category);
    myForm.append("price", price);
    myForm.append("duration", duration);
    myForm.append("file", image);

    try {
      const { data } = await axios.post(`${server}/api/course/new`, myForm, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });

      toast.success(data.message);
      setBtnLoading(false);
      await fetchInstructorCourses();
      await fetchCourses();
      setImage("");
      setTitle("");
      setDescription("");
      setDuration("");
      setImagePrev("");
      setPrice("");
      setCategory("");
    } catch (error) {
      toast.error(error.response.data.message);
      setBtnLoading(false);
    }
  };

  return (
    <Layout>
      <div className="instructor-courses">
        <div className="left">
          <h1>My Courses</h1>
          <div className="dashboard-content">
            {myCourses && myCourses.length > 0 ? (
              myCourses.map((e) => {
                return <CourseCard key={e._id} course={e} />;
              })
            ) : (
              <p>No Courses Yet</p>
            )}
          </div>
        </div>

        <div className="right">
          <div className="add-course">
            <div className="course-form">
              <h2>Add Course</h2>
              <form onSubmit={submitHandler}>
                <label htmlFor="text">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />

                <label htmlFor="text">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />

                <label htmlFor="text">Price</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />

                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value={""}>Select Category</option>
                  {categories.map((e) => (
                    <option value={e} key={e}>
                      {e}
                    </option>
                  ))}
                </select>

                <label htmlFor="text">Duration</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  required
                />

                <input type="file" required onChange={changeImageHandler} />
                {imagePrev && <img src={imagePrev} alt="" width={300} />}

                <button
                  type="submit"
                  disabled={btnLoading}
                  className="common-btn"
                >
                  {btnLoading ? "Please Wait..." : "Add"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default InstructorCourses;
