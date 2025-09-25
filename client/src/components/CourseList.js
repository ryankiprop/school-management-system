import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';

const courseValidationSchema = yup.object({
  name: yup.string().required('Course name is required').min(2, 'Course name must be at least 2 characters'),
  course_code: yup.string().matches(/^[A-Z]{3,4}\d{3,4}$/, 'Course code must be 3-4 letters followed by 3-4 numbers').required('Course code is required'),
  credits: yup.number().min(1, 'Credits must be at least 1').max(5, 'Credits must be at most 5').required('Credits are required'),
  teacher_id: yup.number().required('Teacher is required')
});

function CourseList() {
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const apiUrl = process.env.REACT_APP_API_URL || 'https://school-management-system-6ab5.onrender.com';

  useEffect(() => {
    fetchCourses();
    fetchTeachers();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch(`${apiUrl}/courses`);
      if (!response.ok) throw new Error('Failed to fetch courses');
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      alert('Error loading courses. Please check if the backend server is running.');
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await fetch(`${apiUrl}/teachers`);
      if (!response.ok) throw new Error('Failed to fetch teachers');
      const data = await response.json();
      setTeachers(data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const formik = useFormik({
    initialValues: {
      name: '',
      course_code: '',
      credits: '',
      teacher_id: ''
    },
    validationSchema: courseValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const response = await fetch(`${apiUrl}/courses`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...values,
            credits: parseInt(values.credits),
            teacher_id: parseInt(values.teacher_id)
          }),
        });

        if (response.ok) {
          const newCourse = await response.json();
          setCourses([...courses, newCourse]);
          resetForm();
          alert('Course added successfully!');
        } else {
          const error = await response.json();
          alert(`Error: ${error.error}`);
        }
      } catch (error) {
        console.error('Error creating course:', error);
        alert('Error creating course. Please check your connection.');
      }
    },
  });

  return (
    <div>
      <div className="list-header">
        <h2>Courses</h2>
      </div>

      <div className="form-container" style={{ marginBottom: '2rem' }}>
        <h3>Add New Course</h3>
        <form onSubmit={formik.handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Course Name</label>
            <input
              id="name"
              name="name"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.name}
              placeholder="Enter course name"
            />
            {formik.touched.name && formik.errors.name ? (
              <div className="error">{formik.errors.name}</div>
            ) : null}
          </div>

          <div className="form-group">
            <label htmlFor="course_code">Course Code</label>
            <input
              id="course_code"
              name="course_code"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.course_code}
              placeholder="e.g., MATH101"
            />
            {formik.touched.course_code && formik.errors.course_code ? (
              <div className="error">{formik.errors.course_code}</div>
            ) : null}
          </div>

          <div className="form-group">
            <label htmlFor="credits">Credits</label>
            <input
              id="credits"
              name="credits"
              type="number"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.credits}
              min="1"
              max="5"
              placeholder="1-5"
            />
            {formik.touched.credits && formik.errors.credits ? (
              <div className="error">{formik.errors.credits}</div>
            ) : null}
          </div>

          <div className="form-group">
            <label htmlFor="teacher_id">Teacher</label>
            <select
              id="teacher_id"
              name="teacher_id"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.teacher_id}
            >
              <option value="">Select Teacher</option>
              {teachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name} - {teacher.department}
                </option>
              ))}
            </select>
            {formik.touched.teacher_id && formik.errors.teacher_id ? (
              <div className="error">{formik.errors.teacher_id}</div>
            ) : null}
          </div>

          <button type="submit" className="btn">Add Course</button>
        </form>
      </div>

      <div className="list-container">
        {courses.length === 0 ? (
          <div className="list-item">
            <p>No courses found. Make sure the backend server is running.</p>
          </div>
        ) : (
          courses.map(course => (
            <div key={course.id} className="list-item">
              <div>
                <h3>{course.name} ({course.course_code})</h3>
                <p>Credits: {course.credits} | Teacher: {course.teacher?.name}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CourseList;