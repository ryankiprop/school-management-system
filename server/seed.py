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
    # Clear in correct order to avoid foreign key constraints
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

    # Prefixes must be 3–4 letters to pass validation
    courses_data = [
        {'name': 'Algebra I', 'prefix': 'MATH', 'credits': 4},
        {'name': 'Biology', 'prefix': 'SCIE', 'credits': 4},
        {'name': 'English Literature', 'prefix': 'ENGL', 'credits': 3},
        {'name': 'World History', 'prefix': 'HIST', 'credits': 3},
        {'name': 'Art Fundamentals', 'prefix': 'ARTS', 'credits': 2},
        {'name': 'Physical Education', 'prefix': 'PHED', 'credits': 1},
        {'name': 'Chemistry', 'prefix': 'CHEM', 'credits': 4},
        {'name': 'Calculus', 'prefix': 'MATH', 'credits': 4},
    ]

    courses = []
    for i, course_data in enumerate(courses_data):
        # Generate a valid number (3–4 digits)
        number = randint(100, 499)  # ensures 3 digits
        code = f"{course_data['prefix']}{number}"

        course = Course(
            name=course_data['name'],
            course_code=code,
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
                    semester=rc(semesters)  # FIXED: Added closing parenthesis
                )
                student_courses.add(course)
                db.session.add(enrollment)
    db.session.commit()  # FIXED: Moved outside the inner loop

def create_assignments(courses):
    print("Creating assignments...")
    assignments = []
    for course in courses:
        for i in range(3):
            assignment = Assignment(
                title=f"{course.name} Assignment {i+1}",
                description=fake.paragraph(),
                due_date=datetime.now() + timedelta(days=randint(7, 30)),  # FIXED: Variable due dates
                max_points=rc([100, 50, 75, 25]),
                course_id=course.id
            )
            assignments.append(assignment)
            db.session.add(assignment)
    db.session.commit()  # FIXED: Moved outside the inner loop
    return assignments

def create_assignment_submissions(students, assignments):
    print("Creating assignment submissions...")
    for assignment in assignments:
        # Get enrolled students for this assignment's course
        enrolled_students = [enrollment.student for enrollment in assignment.course.enrollments]
        
        if enrolled_students:  # Check if there are enrolled students
            # Create submissions for 1 to all enrolled students
            num_submissions = randint(1, len(enrolled_students))
            
            for student in enrolled_students[:num_submissions]:
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
    with app.app_context():
        print("Starting database seeding...")
        clear_data()

        teachers = create_teachers()
        students = create_students()
        courses = create_courses(teachers)
        create_enrollments(students, courses)
        assignments = create_assignments(courses)
        create_assignment_submissions(students, assignments)
        
        print("Database seeded successfully!")
        print(f"Created: {len(teachers)} teachers, {len(students)} students, {len(courses)} courses")