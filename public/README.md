# Building REST API with Node, JWT(Json Web Token) and Express 4

## Introduction
* In this tutorial we will be developing simple REST API for movies collection with their released date. We gonna implement simple CRUD(Create, Read, Update and Delete) operations on movie collection data in our journey.
* Refer medium article for complete [tutorial](https://medium.com/@bhanushali.mahesh3/building-a-restful-crud-api-with-node-js-jwt-bcrypt-express-and-mongodb-4e1fb20b7f3d)

## Requirements
* Node, NPM & MongoDB

## Installation
* Clone this repo: ``` git clone https://github.com/bhanushalimahesh3/node-rest-api-jwt.git ```
* Install dependecies: ``` npm install ```
* Install nodemon: ``` npm install nodemon -g ```


class User {
    role: 1, //1=Super, 2=Admin, 3=Staff, 4=Teacher, 5=Student, 6=Parent
    FirstName: String,
    LastName: String,
    Identification: String,
    BirthDate: Date,
    schoolId: ObjectId,
    Parent: ObjectId,
    Courses: []
}

class School {
    Name: String,
    Address: String,
    Type: Enum,
    Users: [],
    schoolTag: Number,
    ClassRooms: []
}

class Definition {
    Term: Number,
    Def: String,
    Category: Number
}

class Course {
    DefId: ObjectId, //Math-I
    Level: 6,
}


class ClassRoom {
    Status: ObjectId, //{NotStarted=0, Active=1, Archived=2}
    Name: '1st-TAKHTI',
    Level: 'gid01',
    Students: ['id01', 'id02', 'id03'],
    Lessons: [
        {
            WeeklyProgram: [13, 33],
            Course: 'courseId01',
            Teacher: 'teacherId01',
            Marks: [
                {
                    name: 'Mid1',
                    values: [
                        {StudentId: 'id01', Mark: 20},
                        {StudentId: 'id02', Mark: 18},
                        {StudentId: 'id03', Mark: 19.5},
                    ]
                },
                {
                    name: 'final'
                },
                {
                    name: 'total'
                }
            ],
            Presence: [
                {
                    WeekNo: 1,
                    Program: 13,
                    Students: [
                        {Student: 'id01', Note: 'Well Done'},
                        {Student: 'id03'}
                    ]
                },
                {
                    WeekNo: 1,
                    Program: 33,
                },
            ]
        }
    ],
}



class Definition {
    T: Number, //Term
    D: String, //Definition
    C: Number //Category
}

class User {
    Phone: String,
    Password: String,
    FirstName: String,
    LastName: String,
    DOB: Date,
    Email: String,
    ProvinceCode: Number,
    CityCode: Number,
    DetailAddress: String,
    Job: String,
}

class Field {
    Step: Number,
    Type: String,
    Name: String,
    Label: String,
    Value: String,
    Options: [{Key: String, Value: String}]
}

class Reshte {
    Name: String,
    Parent: ObjectId, //Id of parent's Reshte
    Fields: [Field],
}

class Booking { //An Instance of a Reshte
    UserId: ObjectId, //Owner
    Reshte: ObjectId,
    Fields: [{Field}],
    FirstName: String,
    LastName: String,
    ...MoreInfo,
}

