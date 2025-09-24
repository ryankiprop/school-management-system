from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import validates
import re

from config import db, bcrypt

class Student(db.Model, SerializerMixin):
    __tablename__ = 'students'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    grade_level = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, onupdate=db.func.now())
    
    # One-to-many relationship: Student has many Enrollments
    enrollments = db.relationship('Enrollment', back_populates='student', cascade='all, delete-orphan')
    
    # Many-to-many relationship with Courses through Enrollments
    courses = association_proxy('enrollments', 'course')
    
    # One-to-many relationship: Student has many AssignmentSubmissions
    assignment_submissions = db.relationship('AssignmentSubmission', back_populates='student', cascade='all, delete-orphan')
    
    serialize_rules = ('-enrollments.student', '-assignment_submissions.student', '-courses.students')
    
    @validates('name')
    def validate_name(self, key, name):
        if not name or len(name.strip()) < 2:
            raise ValueError("Name must be at least 2 characters long")
        return name.strip()
    
    @validates('email')
    def validate_email(self, key, email):
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
            raise ValueError("Invalid email format")
        return email
    
    @validates('grade_level')
    def validate_grade_level(self, key, grade_level):
        if not isinstance(grade_level, int) or grade_level < 1 or grade_level > 12:
            raise ValueError("Grade level must be between 1 and 12")
        return grade_level

class Teacher(db.Model, SerializerMixin):
    __tablename__ = 'teachers'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    department = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, onupdate=db.func.now())
    
    # One-to-many relationship: Teacher has many Courses
    courses = db.relationship('Course', back_populates='teacher', cascade='all, delete-orphan')
    
    serialize_rules = ('-courses.teacher',)
    
    @validates('name')
    def validate_name(self, key, name):
        if not name or len(name.strip()) < 2:
            raise ValueError("Name must be at least 2 characters long")
        return name.strip()
    
    @validates('email')
    def validate_email(self, key, email):
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
            raise ValueError("Invalid email format")
        return email
    
    @validates('department')
    def validate_department(self, key, department):
        valid_departments = ['Math', 'Science', 'English', 'History', 'Art', 'Music', 'Physical Education']
        if department not in valid_departments:
            raise ValueError(f"Department must be one of: {', '.join(valid_departments)}")
        return department

class Course(db.Model, SerializerMixin):
    __tablename__ = 'courses'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    course_code = db.Column(db.String(20), unique=True, nullable=False)
    credits = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, onupdate=db.func.now())
    
    # Foreign key for one-to-many relationship with Teacher
    teacher_id = db.Column(db.Integer, db.ForeignKey('teachers.id'), nullable=False)
    
    # Relationships
    teacher = db.relationship('Teacher', back_populates='courses')
    enrollments = db.relationship('Enrollment', back_populates='course', cascade='all, delete-orphan')
    assignments = db.relationship('Assignment', back_populates='course', cascade='all, delete-orphan')
    
    # Many-to-many relationship with Students through Enrollments
    students = association_proxy('enrollments', 'student')
    
    serialize_rules = ('-teacher.courses', '-enrollments.course', '-assignments.course', '-students.courses')
    
    @validates('name')
    def validate_name(self, key, name):
        if not name or len(name.strip()) < 2:
            raise ValueError("Course name must be at least 2 characters long")
        return name.strip()
    
    @validates('course_code')
    def validate_course_code(self, key, course_code):
        if not re.match(r'^[A-Z]{3,4}\d{3,4}$', course_code):
            raise ValueError("Course code must be 3-4 letters followed by 3-4 numbers (e.g., MATH101)")
        return course_code.upper()
    
    @validates('credits')
    def validate_credits(self, key, credits):
        if not isinstance(credits, int) or credits < 1 or credits > 5:
            raise ValueError("Credits must be between 1 and 5")
        return credits

# Many-to-many relationship model with user-submittable attribute
class Enrollment(db.Model, SerializerMixin):
    __tablename__ = 'enrollments'
    
    id = db.Column(db.Integer, primary_key=True)
    enrollment_date = db.Column(db.DateTime, server_default=db.func.now())
    semester = db.Column(db.String(20), nullable=False)  # User-submittable attribute
    
    # Foreign keys
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    
    # Relationships
    student = db.relationship('Student', back_populates='enrollments')
    course = db.relationship('Course', back_populates='enrollments')
    
    serialize_rules = ('-student.enrollments', '-course.enrollments')
    
    @validates('semester')
    def validate_semester(self, key, semester):
        valid_semesters = ['Fall', 'Spring', 'Summer']
        if semester not in valid_semesters:
            raise ValueError(f"Semester must be one of: {', '.join(valid_semesters)}")
        return semester

class Assignment(db.Model, SerializerMixin):
    __tablename__ = 'assignments'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    due_date = db.Column(db.DateTime, nullable=False)
    max_points = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, onupdate=db.func.now())
    
    # Foreign key
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    
    # Relationships
    course = db.relationship('Course', back_populates='assignments')
    submissions = db.relationship('AssignmentSubmission', back_populates='assignment', cascade='all, delete-orphan')
    
    serialize_rules = ('-course.assignments', '-submissions.assignment')
    
    @validates('title')
    def validate_title(self, key, title):
        if not title or len(title.strip()) < 2:
            raise ValueError("Assignment title must be at least 2 characters long")
        return title.strip()
    
    @validates('max_points')
    def validate_max_points(self, key, max_points):
        if not isinstance(max_points, int) or max_points < 1 or max_points > 1000:
            raise ValueError("Max points must be between 1 and 1000")
        return max_points

class AssignmentSubmission(db.Model, SerializerMixin):
    __tablename__ = 'assignment_submissions'
    
    id = db.Column(db.Integer, primary_key=True)
    submission_date = db.Column(db.DateTime, server_default=db.func.now())
    content = db.Column(db.Text)
    points_earned = db.Column(db.Integer)  # User-submittable attribute
    submitted = db.Column(db.Boolean, default=False)
    
    # Foreign keys
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False)
    assignment_id = db.Column(db.Integer, db.ForeignKey('assignments.id'), nullable=False)
    
    # Relationships
    student = db.relationship('Student', back_populates='assignment_submissions')
    assignment = db.relationship('Assignment', back_populates='submissions')
    
    serialize_rules = ('-student.assignment_submissions', '-assignment.submissions')
    
    @validates('points_earned')
    def validate_points_earned(self, key, points_earned):
        if points_earned is not None:
            if not isinstance(points_earned, int) or points_earned < 0:
                raise ValueError("Points earned must be a non-negative integer")
            if points_earned > self.assignment.max_points:
                raise ValueError("Points earned cannot exceed assignment max points")
        return points_earned
    
    @validates('content')
    def validate_content(self, key, content):
        if content and len(content.strip()) > 10000:
            raise ValueError("Submission content must be less than 10000 characters")
        return content