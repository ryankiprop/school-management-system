import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';

const studentValidationSchema = yup.object({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  grade_level: yup.number().min(1, 'Grade must be at least 1').max(12, 'Grade must be at most 12').required('Grade level is required')
});

function StudentList() {
  const [students, setStudents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const apiUrl = process.env.REACT_APP_API_URL || 'https://school-management-system-6ab5.onrender.com';

  useEffect(() => {
    fetchStudents();
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

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      grade_level: ''
    },
    validationSchema: studentValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const response = await fetch(`${apiUrl}/students`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        });

        if (response.ok) {
          const newStudent = await response.json();
          setStudents([...students, newStudent]);
          resetForm();
          setShowForm(false);
          alert('Student added successfully!');
        } else {
          const error = await response.json();
          alert(`Error: ${error.error}`);
        }
      } catch (error) {
        console.error('Error creating student:', error);
        alert('Error creating student. Please check your connection.');
      }
    },
  });

  const deleteStudent = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        const response = await fetch(`${apiUrl}/students/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setStudents(students.filter(student => student.id !== id));
          alert('Student deleted successfully!');
        } else {
          alert('Error deleting student');
        }
      } catch (error) {
        console.error('Error deleting student:', error);
        alert('Error deleting student. Please check your connection.');
      }
    }
  };

  return (
    <div>
      <div className="list-header">
        <h2>Students</h2>
        <button className="btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add New Student'}
        </button>
      </div>

      {showForm && (
        <div className="form-container" style={{ marginBottom: '2rem' }}>
          <h3>Add New Student</h3>
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
                placeholder="Enter student name"
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
                placeholder="Enter email address"
              />
              {formik.touched.email && formik.errors.email ? (
                <div className="error">{formik.errors.email}</div>
              ) : null}
            </div>

            <div className="form-group">
              <label htmlFor="grade_level">Grade Level</label>
              <input
                id="grade_level"
                name="grade_level"
                type="number"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.grade_level}
                min="1"
                max="12"
                placeholder="Enter grade (1-12)"
              />
              {formik.touched.grade_level && formik.errors.grade_level ? (
                <div className="error">{formik.errors.grade_level}</div>
              ) : null}
            </div>

            <button type="submit" className="btn">Add Student</button>
          </form>
        </div>
      )}

      <div className="list-container">
        {students.length === 0 ? (
          <div className="list-item">
            <p>No students found. Make sure the backend server is running.</p>
          </div>
        ) : (
          students.map(student => (
            <div key={student.id} className="list-item">
              <div>
                <h3>{student.name}</h3>
                <p>Email: {student.email} | Grade: {student.grade_level}</p>
              </div>
              <div className="actions">
                <button 
                  className="btn btn-danger" 
                  onClick={() => deleteStudent(student.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default StudentList;