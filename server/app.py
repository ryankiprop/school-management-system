#!/usr/bin/env python3

# Standard library imports

# Remote library imports
from flask import request,make_response, session
from flask_restful import Resource
from flask_sqlalchemy.exc import IntegrityError

# Local imports
from config import app, db, api
# Add your model imports

from models import Student, Teacher, Course, Enrollment, Assignment, AssignmentSubmission


# Views go here!

@app.route('/')
def index():
    return '<h1>School Management System API</h1>'

class Students(Resource):
    def get(self):
        students = [student.to_dict() for student in Student.query.all()]
        return make_response(students, 200)
    
    def post(self):
        data = request.get_json()
        try:
            student = Student(
                name=data['name'],
                email=data['email'],
                grade_level=data['grade_level']
            )
            db.session.add(student)
            db.session.commit()
            return make_response(student.to_dict(), 201)
        except ValueError as e:
            return make_response({'error': str(e)}, 400)
        except IntegrityError:
            return make_response({'error': 'Email already exists'}, 400)
        
class StudentByID(Resource):
    def get(self, id):
        student = Student.query.get(id)
        if not student:
            return make_response({'error': 'Student not found'}, 404)
        return make_response(student.to_dict(), 200)
    
    def patch(self, id):
        student = Student.query.get(id)
        if not student:
            return make_response({'error': 'Student not found'}, 404)
        data = request.get_json()
        try:
            for attr in data:
                setattr(student, attr, data[attr])
            db.session.commit()
            return make_response(student.to_dict(), 200)
        except ValueError as e:
            return make_response({'error': str(e)}, 400)
        
    def delete(self, id):
        student = Student.query.get(id)
        if not student:
            return make_response({'error': 'Student not found'}, 404)
        db.session.delete(student)
        db.session.commit()
        return make_response({}, 204)
    
class Teachers(Resource):
    def get(self):
        teachers = [teacher.to_dict() for teacher in Teacher.query.all()]
        return make_response(teachers, 200)
    
    def post(self):
        data = request.get_json()
        try:
            teacher = Teacher(
                name=data['name'],
                email=data['email'],
                department=data['department']
            )
            db.session.add(teacher)
            db.session.commit()
            return make_response(teacher.to_dict(), 201)
        except ValueError as e:
            return make_response({'error': str(e)}, 400)
        except IntegrityError:
            return make_response({'error': 'Email already exists'}, 400) 

class Courses(Resource):
    def get(self):
        courses = [course.to_dict() for course in Course.query.all()]
        return make_response(courses, 200)
    
    def post(self):
        data = request.get_json()
        try:
            course = Course(
                name=data['name'],
                course_code=data['course_code'],
                credits=data['credits'],
                teacher_id=data['teacher_id']
            )
            db.session.add(course)
            db.session.commit()
            return make_response(course.to_dict(), 201)
        except ValueError as e:
            return make_response({'error': str(e)}, 400)
        except IntegrityError:
            return make_response({'error': 'Course code already exists'}, 400)  

class Enrollments(Resource):
    def get(self):
        enrollments = [enrollment.to_dict() for enrollment in Enrollment.query.all()]
        return make_response(enrollments, 200)
    
    def post(self):
        data = request.get_json()
        try:
            enrollment = Enrollment(
                student_id=data['student_id'],
                course_id=data['course_id'],
                semester=data('semester')
            )
            db.session.add(enrollment)
            db.session.commit()
            return make_response(enrollment.to_dict(), 201)
        except ValueError as e:
            return make_response({'error': str(e)}, 400)
        except IntegrityError:
            return make_response({'error': 'Student already enrolled in this course'}, 400)   

class Assignments(Resource):
    def get(self):
        assignments = [assignment.to_dict() for assignment in Assignment.query.all()]
        return make_response(assignments, 200)
    
    def post(self):
        data = request.get_json()
        try:
            assignment = Assignment(
                title=data['title'],
                description=data.get('description'),
                due_date=data['due_date'],
                max_points=data['max_points'],
                course_id=data['course_id']
            )
            db.session.add(assignment)
            db.session.commit()
            return make_response(assignment.to_dict(), 201)
        except ValueError as e:
            return make_response({'error': str(e)}, 400) 

class AssignmentSubmissions(Resource):
    def get(self):
        submissions = [submission.to_dict() for submission in AssignmentSubmission.query.all()]
        return make_response(submissions, 200)
    
    def post(self):
        data = request.get_json()
        try:
            submission = AssignmentSubmission(
                assignment_id=data['assignment_id'],
                student_id=data['student_id'],
                points_earned=data.get['points_earned'],
                content=data.get('content'),
                submitted=data.get('submitted', False),
            )
            db.session.add(submission)
            db.session.commit()
            return make_response(submission.to_dict(), 201)
        except ValueError as e:
            return make_response({'error': str(e)}, 400) 

api.add_resource(Students, '/students')
api.add_resource(StudentByID, '/students/<int:id>')       
api.add_resource(Teachers, "/teachers")
api.add_resource(Courses, "/courses")
api.add_resource(Enrollments, "/enrollments")
api.add_resource(Assignments, "/assignments")
api.add_resource(AssignmentSubmission, "/assignment_submisson") 
                            


if __name__ == '__main__':
    app.run(port=5555, debug=True)

