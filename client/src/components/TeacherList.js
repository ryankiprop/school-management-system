import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';

const teacherValidationSchema = yup.object({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  department: yup.string().required('Department is required')
});

function TeacherList() {
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await fetch('/teachers');
      const data = await response.json();
      setTeachers(data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      department: ''
    },
    validationSchema: teacherValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const response = await fetch('/teachers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        });

        if (response.ok) {
          const newTeacher = await response.json();
          setTeachers([...teachers, newTeacher]);
          resetForm();
        } else {
          const error = await response.json();
          alert(`Error: ${error.error}`);
        }
      } catch (error) {
        console.error('Error creating teacher:', error);
      }
    },
  });

  return (
    <div>
      <div className="list-header">
        <h2>Teachers</h2>
      </div>

      <div className="form-container" style={{ marginBottom: '2rem' }}>
        <h3>Add New Teacher</h3>
        <form onSubmit={formik.handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.name}
            />
            {formik.touched.name && formik.errors.name ? (
              <div className="error">{formik.errors.name}</div>
            ) : null}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
            />
            {formik.touched.email && formik.errors.email ? (
              <div className="error">{formik.errors.email}</div>
            ) : null}
          </div>

          <div className="form-group">
            <label htmlFor="department">Department</label>
            <select
              id="department"
              name="department"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.department}
            >
              <option value="">Select Department</option>
              <option value="Math">Math</option>
              <option value="Science">Science</option>
              <option value="English">English</option>
              <option value="History">History</option>
              <option value="Art">Art</option>
              <option value="Music">Music</option>
              <option value="Physical Education">Physical Education</option>
            </select>
            {formik.touched.department && formik.errors.department ? (
              <div className="error">{formik.errors.department}</div>
            ) : null}
          </div>

          <button type="submit" className="btn">Add Teacher</button>
        </form>
      </div>

      <div className="list-container">
        {teachers.map(teacher => (
          <div key={teacher.id} className="list-item">
            <div>
              <h3>{teacher.name}</h3>
              <p>Email: {teacher.email} | Department: {teacher.department}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TeacherList;