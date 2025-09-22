import { pgTable, serial, varchar, integer, text, timestamp, pgEnum, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Updated enum to match the requirements
export const todoStatusEnum = pgEnum('todo_status', ['todo', 'in_progress', 'completed']);
export const todoPriorityEnum = pgEnum('todo_priority', ['low', 'medium', 'high', 'urgent']);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 128 }).notNull(),
  email: varchar('email', { length: 256 }).notNull().unique(),
  password: varchar('password', { length: 256 }).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const todos = pgTable('todos', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 256 }).notNull(),
  description: text('description'),
  status: todoStatusEnum('status').default('todo').notNull(),
  priority: todoPriorityEnum('priority').default('medium').notNull(),
  due_date: timestamp('due_date'),
  completed: boolean('completed').default(false).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Session table for authentication
export const sessions = pgTable('sessions', {
  id: varchar('id', { length: 500 }).primaryKey(),
  user_id: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  expires_at: timestamp('expires_at').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  todos: many(todos),
  sessions: many(sessions),
}));

export const todosRelations = relations(todos, ({ one }) => ({
  user: one(users, {
    fields: [todos.user_id],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.user_id],
    references: [users.id],
  }),
}));


