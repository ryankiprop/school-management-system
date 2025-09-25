import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';

const assignmentValidationSchema = yup.object({
  title: yup.string().required('Title is required').min(2, 'Title must be at least 2 characters'),
  description: yup.string().max(10000, 'Description must be less than 10000 characters'),
  due_date: yup.date().required('Due date is required'),
  max_points: yup.number().min(1, 'Max points must be at least 1').max(1000, 'Max points must be at most 1000').required('Max points are required'),
  course_id: yup.number().required('Course is required')
});

function AssignmentList() {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetchAssignments();
    fetchCourses();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await fetch('/assignments');
      const data = await response.json();
      setAssignments(data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch('/courses');
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      due_date: '',
      max_points: '',
      course_id: ''
    },
    validationSchema: assignmentValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const response = await fetch('/assignments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...values,
            max_points: parseInt(values.max_points),
            course_id: parseInt(values.course_id)
          }),
        });

        if (response.ok) {
          const newAssignment = await response.json();
          setAssignments([...assignments, newAssignment]);
          resetForm();
        } else {
          const error = await response.json();
          alert(`Error: ${error.error}`);
        }
      } catch (error) {
        console.error('Error creating assignment:', error);
      }
    },
  });

  return (
    <div>
      <div className="list-header">
        <h2>Assignments</h2>
      </div>

      <div className="form-container" style={{ marginBottom: '2rem' }}>
        <h3>Create New Assignment</h3>
        <form onSubmit={formik.handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              name="title"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.title}
            />
            {formik.touched.title && formik.errors.title ? (
              <div className="error">{formik.errors.title}</div>
            ) : null}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              rows="4"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.description}
            />
            {formik.touched.description && formik.errors.description ? (
              <div className="error">{formik.errors.description}</div>
            ) : null}
          </div>

          <div className="form-group">
            <label htmlFor="due_date">Due Date</label>
            <input
              id="due_date"
              name="due_date"
              type="datetime-local"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.due_date}
            />
            {formik.touched.due_date && formik.errors.due_date ? (
              <div className="error">{formik.errors.due_date}</div>
            ) : null}
          </div>

          <div className="form-group">
            <label htmlFor="max_points">Max Points</label>
            <input
              id="max_points"
              name="max_points"
              type="number"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.max_points}
              min="1"
              max="1000"
            />
            {formik.touched.max_points && formik.errors.max_points ? (
              <div className="error">{formik.errors.max_points}</div>
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
                  {course.name} ({course.course_code})
                </option>
              ))}
            </select>
            {formik.touched.course_id && formik.errors.course_id ? (
              <div className="error">{formik.errors.course_id}</div>
            ) : null}
          </div>

          <button type="submit" className="btn">Create Assignment</button>
        </form>
      </div>

      <div className="list-container">
        {assignments.map(assignment => (
          <div key={assignment.id} className="list-item">
            <div>
              <h3>{assignment.title}</h3>
              <p>Course: {assignment.course?.name} | Due: {new Date(assignment.due_date).toLocaleString()} | Max Points: {assignment.max_points}</p>
              {assignment.description && <p>{assignment.description}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AssignmentList;