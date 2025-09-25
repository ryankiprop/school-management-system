import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';

const enrollmentValidationSchema = yup.object({
  student_id: yup.number().required('Student is required'),
  course_id: yup.number().required('Course is required'),
  semester: yup.string().required('Semester is required')
});

function EnrollmentForm() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5555';

  useEffect(() => {
    fetchStudents();
    fetchCourses();
    fetchEnrollments();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch(`${apiUrl}/students`);
      if (!response.ok) throw new Error('Failed to fetch students');
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
      alert('Error loading students. Please check if the backend server is running.');
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch(`${apiUrl}/courses`);
      if (!response.ok) throw new Error('Failed to fetch courses');
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchEnrollments = async () => {
    try {
      const response = await fetch(`${apiUrl}/enrollments`);
      if (!response.ok) throw new Error('Failed to fetch enrollments');
      const data = await response.json();
      setEnrollments(data);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    }
  };

  const formik = useFormik({
    initialValues: {
      student_id: '',
      course_id: '',
      semester: ''
    },
    validationSchema: enrollmentValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const response = await fetch(`${apiUrl}/enrollments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...values,
            student_id: parseInt(values.student_id),
            course_id: parseInt(values.course_id)
          }),
        });

        if (response.ok) {
          const newEnrollment = await response.json();
          setEnrollments([...enrollments, newEnrollment]);
          resetForm();
          alert('Student enrolled successfully!');
        } else {
          const error = await response.json();
          alert(`Error: ${error.error}`);
        }
      } catch (error) {
        console.error('Error creating enrollment:', error);
        alert('Error creating enrollment. Please check your connection.');
      }
    },
  });

  return (
    <div>
      <div className="list-header">
        <h2>Enroll Students in Courses</h2>
      </div>

      <div className="form-container" style={{ marginBottom: '2rem' }}>
        <h3>New Enrollment</h3>
        <form onSubmit={formik.handleSubmit}>
          <div className="form-group">
            <label htmlFor="student_id">Student</label>
            <select
              id="student_id"
              name="student_id"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.student_id}
            >
              <option value="">Select Student</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.name} (Grade {student.grade_level})
                </option>
              ))}
            </select>
            {formik.touched.student_id && formik.errors.student_id ? (
              <div className="error">{formik.errors.student_id}</div>
            ) : null}
          </div>

          <div className="form-group">
            <label htmlFor="course_id">Course</label>
            <select
              id="course_id"
              name="course_id"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.course_id}
            >
              <option value="">Select Course</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.name} ({course.course_code}) - {course.teacher?.name}
                </option>
              ))}
            </select>
            {formik.touched.course_id && formik.errors.course_id ? (
              <div className="error">{formik.errors.course_id}</div>
            ) : null}
          </div>

          <div className="form-group">
            <label htmlFor="semester">Semester</label>
            <select
              id="semester"
              name="semester"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.semester}
            >
              <option value="">Select Semester</option>
              <option value="Fall">Fall</option>
              <option value="Spring">Spring</option>
              <option value="Summer">Summer</option>
            </select>
            {formik.touched.semester && formik.errors.semester ? (
              <div className="error">{formik.errors.semester}</div>
            ) : null}
          </div>

          <button type="submit" className="btn">Enroll Student</button>
        </form>
      </div>

      <div className="list-container">
        <h3 style={{ padding: '1.5rem', borderBottom: '1px solid #eee' }}>Current Enrollments</h3>
        {enrollments.length === 0 ? (
          <div className="list-item">
            <p>No enrollments found.</p>
          </div>
        ) : (
          enrollments.map(enrollment => (
            <div key={enrollment.id} className="list-item">
              <div>
                <h3>{enrollment.student?.name} in {enrollment.course?.name}</h3>
                <p>Semester: {enrollment.semester} | Enrollment Date: {new Date(enrollment.enrollment_date).toLocaleDateString()}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default EnrollmentForm;