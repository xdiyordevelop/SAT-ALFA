INSERT INTO "User" (id, username, "passwordHash", role, "createdAt", "updatedAt") 
VALUES 
  ('admin-user-1', 'admin', '$2b$10$EYu29dvx7LH2p9DYsJqcUOoZo1/WQWNFgzww8Jim67bG05FRScYPC', 'ADMIN', NOW(), NOW()),
  ('student-user-1', 'student1', '$2b$10$gmFVliOY6u4brGhI9fMCnu9vkkqw.7nhSt4AWsxZA3NTxTmWxsRK6', 'STUDENT', NOW(), NOW());

INSERT INTO "StudentProfile" (id, "userId", "firstName", "lastName", phone, "monthlyFee", "enrollmentDate", status, "createdAt", "updatedAt")
VALUES 
  ('student-profile-1', 'student-user-1', 'John', 'Doe', '+1234567890', 100, NOW(), 'ACTIVE', NOW(), NOW());
