# Ticket Management API Documentation

## Overview
The Ticket Management module provides comprehensive CRUD operations for handling support tickets with role-based access control.

## Authentication
All endpoints require authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## API Endpoints

### 1. Create Ticket
**POST** `/api/tickets`
- **Access**: Student only
- **Description**: Create a new support ticket
- **Request Body**:
```json
{
  "title": "Issue with course enrollment",
  "description": "Cannot enroll in CS101 course",
  "category": "academic",
  "priority": "medium"
}
```
- **Response**: Created ticket with student information

### 2. Get My Tickets
**GET** `/api/tickets/my`
- **Access**: Student only
- **Description**: Retrieve current student's tickets
- **Query Parameters**:
  - `status`: Filter by status (open, in_progress, resolved, closed)
  - `category`: Filter by category
  - `priority`: Filter by priority
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
- **Response**: Paginated list of student's tickets

### 3. Get All Tickets (Admin)
**GET** `/api/tickets`
- **Access**: Admin only
- **Description**: Retrieve all tickets with statistics
- **Query Parameters**:
  - `status`: Filter by status
  - `category`: Filter by category
  - `priority`: Filter by priority
  - `studentId`: Filter by specific student
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
- **Response**: Paginated tickets with summary statistics

### 4. Get Ticket by ID
**GET** `/api/tickets/:id`
- **Access**: Student (own tickets), Admin (all tickets), Department (all tickets)
- **Description**: Retrieve specific ticket details
- **Response**: Single ticket with full details

### 5. Update Ticket Status
**PUT** `/api/tickets/:id/status`
- **Access**: Department only
- **Description**: Update ticket status and add resolution notes
- **Request Body**:
```json
{
  "status": "resolved",
  "resolutionNotes": "Issue resolved by updating course prerequisites"
}
```
- **Response**: Updated ticket with status history

## Status Flow
- **open** → **in_progress** → **resolved** → **closed**
- Status changes are logged with timestamps and user information

## Error Handling
All endpoints return standardized error responses:
```json
{
  "success": false,
  "message": "Error description"
}
```

## Role-Based Access
- **Student**: Create tickets, view own tickets
- **Admin**: View all tickets with statistics
- **Department**: Update ticket status and resolution

## Features
- Automatic status history logging
- Pagination and filtering support
- Role-based access control
- Input validation and sanitization
- MongoDB indexing for performance
