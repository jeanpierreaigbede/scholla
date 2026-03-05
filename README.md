SCHOLA – Audio Learning Platform for SHS Students
Overview

SCHOLA is a mobile-first learning platform designed to support Senior High School (SHS) students preparing for WASSCE.

The platform focuses on audio-first learning, allowing students to listen to course content based on the official curriculum. This approach helps students study even when they are tired, commuting, or away from textbooks.

Instead of relying only on dense written material, SCHOLA enables students to listen to lessons, study offline, and test their understanding through AI-generated quizzes.

The project is currently focused on validating the technical direction and development environment before full product development.

Core Product Idea

SCHOLA is a mobile application that enables students to:

Listen to curriculum-based course audio

Study while commuting or resting

Download lessons for offline learning

Generate quizzes from learning materials

Upload their own study materials and receive AI-generated practice questions

The platform prioritizes accessibility, flexibility, and lightweight learning sessions.

Key Features
1. Audio-Based Learning

Students can listen to structured course lessons based on curriculum materials.

Benefits:

Reduces study fatigue

Enables learning during commuting

Improves accessibility

2. Offline Learning Mode

Students can download lessons to access them without internet connection.

This is important for:

Low data environments

Areas with unstable internet connectivity

3. AI Quiz Generation (RAG System)

Students can upload study materials or notes.

The system uses Retrieval-Augmented Generation (RAG) to generate quizzes based on those materials.

This helps students:

Test their understanding

Practice exam-style questions

Reinforce learning

Technology Stack
Mobile Application

Framework: Flutter

Reason:

Cross-platform support

Single codebase for Android and iOS

Good performance for media-heavy applications

Target Platforms:

Apple App Store

Google Play Store

Backend API

Framework: FastAPI

Responsibilities:

User authentication

Content delivery

Quiz generation requests

Audio content management

Communication with AI services

AI System

Architecture: Retrieval-Augmented Generation (RAG)

Capabilities:

Process student-uploaded materials

Retrieve relevant learning content

Generate quiz questions

Support learning reinforcement

Database

The database will store:

Users

Curriculum content

Audio lessons

Uploaded study materials

Generated quizzes

Progress tracking

Recommended options:

PostgreSQL


Infrastructure

Hosting Components:

Backend API:
Dedicated Server

AI System:
Dedicated Server 

Mobile Distribution:

Apple App Store

Google Play Store

Storage:

Audio files

Uploaded materials

Processed AI embeddings

Possible storage services:

Cloud object storage (e.g. S3 compatible)

System Architecture
Mobile App (Flutter)
        |
        |
        v
Backend API (FastAPI)
        |
        |
        +----------------------+
        |                      |
        v                      v
Database                AI RAG System
(PostgreSQL/MongoDB)     (LLM + Vector DB)
        |                      |
        |                      |
        v                      v
Audio Content Storage   Embeddings + Retrieval
AI Quiz Generation Flow (RAG)

The system follows a Retrieval-Augmented Generation pipeline.

Step 1 – Material Upload

Student uploads study material (PDF, text, or notes).

↓

Step 2 – Text Processing

Backend extracts and cleans text.

↓

Step 3 – Embedding Generation

Text is converted into vector embeddings.

↓

Step 4 – Storage in Vector Database

Embeddings are stored for retrieval.

↓

Step 5 – Query for Quiz Generation

Student requests quiz generation.

↓

Step 6 – Retrieval

Relevant content is retrieved from vector database.

↓

Step 7 – AI Generation

LLM generates quiz questions based on retrieved content.

↓

Step 8 – Response to Mobile App

Generated quiz is returned to the user.


Risk:

AI hallucination or incorrect questions.

Mitigation:

Strict retrieval filtering in RAG pipeline.

2. Audio Storage and Streaming

Audio files may require large storage.

Mitigation:

Use compressed audio formats.

Use scalable object storage.

3. Offline Synchronization

Managing downloaded content across devices may be complex.

Mitigation:

Implement local caching and sync logic.

4. AI Infrastructure Cost

RAG systems can be resource intensive.

Mitigation:

Optimize embeddings

Use batching

Evaluate open-source models

Development Roadmap

Phase 1
Technical validation

Architecture definition

Repository creation

Development environment setup

Phase 2
Core backend development

API endpoints

Content delivery

Authentication

Phase 3
Mobile application prototype

Audio lesson playback

Offline downloads

Phase 4
AI integration

RAG pipeline

Quiz generation

Phase 5
Testing and validation

User testing

Performance improvements

Repository Structure
schola/
│
├── mobile_app/
│   └── Flutter application
│
├── backend/
│   └── FastAPI services
│
├── ai_engine/
│   └── RAG pipeline
│
├── docs/
│   └── architecture diagrams
│
└── README.md
Project Status

Current Stage:

Technical validation and architecture setup.

The team is currently establishing:

Technology stack

System architecture

Development environment

AI integration approach.

Team

SCHOLA Team

Team Lead & Product: Khalifa 
Tech Lead: Jean Pierre Aigbede
Business Lead: ADORGLOH ERIC
