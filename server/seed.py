#!/usr/bin/env python3

# Standard library imports
from random import randint, choice as rc
from datetime import datetime, timedelta

# Remote library imports
from faker import Faker

# Local imports
from config import app, db
from models import Student, Teacher, Course, Enrollment, Assignment, AssignmentSubmission

fake = Faker()

def clear_data():
    print("Clearing existing data...")
    AssignmentSubmission.query.delete()
    Assignment.query.delete()
    Enrollment.query.delete()
    Course.query.delete()
    Student.query.delete()
    Teacher.query.delete()
    db.session.commit()

def create_students(n=10):
    print(f"Creating {n} students...")
    students = []
    for _ in range(n):
        student = Student(
            name=fake.name(),
            email=fake.unique.email(),
            grade_level=randint(9, 12)
        )
        students.append(student)
        db.session.add(student)
    db.session.commit()
    return students

def create_teachers():
    print("Creating teachers...")
    departments = ['Math', 'Science', 'History', 'English', 'Art', 'Physical Education', 'Music']
    teachers = []
    for _ in range(8):
        teacher = Teacher(
            name=fake.name(),
            email=fake.unique.email(),
            department=rc(departments)
        )
        teachers.append(teacher)
        db.session.add(teacher)
    db.session.commit()
    return teachers

def create_courses(teachers):
    print("Creating courses...")
    courses_data = [
        {'name': 'Algebra I', 'code': 'MATH101', 'credits': 4},
        {'name': 'Biology', 'code': 'SCI101', 'credits': 4},
        {'name': 'World History', 'code': 'HIST101', 'credits': 3},
        {'name': 'English Literature', 'code': 'ENG101', 'credits': 3},
        {'name': 'Art Fundamentals', 'code': 'ART101', 'credits': 2},
        {'name': 'Physical Education', 'code': 'PE101', 'credits': 1},
        {'name': 'Music Theory', 'code': 'MUS101', 'credits': 2}
    ]

    courses = []
    for i, course_data in enumerate(courses_data):
        course = Course(
            name=course_data['name'],
            code=course_data['code'],
            credits=course_data['credits'],
            teacher_id=teachers[i % len(teachers)].id
        )
        courses.append(course)
        db.session.add(course)
    db.session.commit()
    return courses

def create_enrollments(students, courses):
    print("Creating enrollments...")
    semesters = ['Fall', 'Spring', 'Summer']

    for student in students:
        student_courses = set()
        for _ in range(randint(4, 6)):
            course = rc(courses)
            if course not in student_courses:
                enrollment = Enrollment(
                    student_id=student.id,
                    course_id=course.id,
                    semester=rc(semesters
                ))
                db.session.commit()

def create_assignments(courses):
    print("Creating assignments...")
    assignments = []
    for course in courses:
        for i in range(3):
            assignment = Assignment(
                title=f"{course.name} Assignment {i+1}",
                description=fake.paragraph(),
                due_date=datetime.now() + timedelta(days=7, minutes=30),
                max_points=rc([100, 50, 75, 25]),
                course_id=course.id
            )
            assignments.append(assignment)
            db.session.add(assignment)
        db.session.commit()
    return assignments

def create_assignment_submissions(students, assignments):
    print("Creating assignment submissions...")
    for assignment in assignments:
        enrolled_students = [enrollment.student for enrollment in assignment.course.enrollments]

        for student in enrolled_students[:randint(3, len(enrolled_students))]:
            submission = AssignmentSubmission(
                assignment_id=assignment.id,
                student_id=student.id,
                content=fake.paragraph() if randint(0, 1) else None,
                points_earned=randint(0, assignment.max_points) if randint(0, 1) else None,
                submitted=rc([True, False])
            )

            db.session.add(submission)
        db.session.commit()
            
if __name__ == '__main__':
    fake = Faker()
    with app.app_context():
        clear_data()

        teachers = create_teachers()
        students = create_students()
        courses = create_courses(teachers)
        create_enrollments(students, courses)
        assignments = create_assignments(courses)
        create_assignment_submissions(students, assignments)
        print("Database seeded successfully!")
        print(f"Created {len(teachers)} teachers, {len(students)} students, {len(courses)} courses")
        print("Starting seed...")
        # Seed code goes here!
