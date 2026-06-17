CREATE TYPE "public"."activity_type" AS ENUM('sowing', 'irrigation', 'spray', 'harvest', 'majdoor', 'other');--> statement-breakpoint
CREATE TYPE "public"."borrowing_status" AS ENUM('pending', 'settled');--> statement-breakpoint
CREATE TYPE "public"."borrowing_type" AS ENUM('given', 'taken');--> statement-breakpoint
CREATE TYPE "public"."expense_category" AS ENUM('seeds', 'fertilizers', 'pesticides', 'diesel', 'labor', 'tractor_rent', 'irrigation_cost', 'machinary', 'other');--> statement-breakpoint
CREATE TYPE "public"."harvest_unit" AS ENUM('quintal', 'kg', 'ton');--> statement-breakpoint
CREATE TYPE "public"."income_category" AS ENUM('crop_sales', 'subsidy', 'milk', 'animal_husbandry', 'other');--> statement-breakpoint
CREATE TYPE "public"."inventory_category" AS ENUM('seed', 'fertilizer', 'pesticide', 'other');--> statement-breakpoint
CREATE TYPE "public"."inventory_unit" AS ENUM('kg', 'liter', 'bag', 'unit');--> statement-breakpoint
CREATE TYPE "public"."language" AS ENUM('hi', 'en', 'mr', 'pa', 'te', 'ta');--> statement-breakpoint
CREATE TYPE "public"."season_status" AS ENUM('active', 'completed', 'archived');--> statement-breakpoint
CREATE TABLE "activity_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"season_id" text NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL,
	"activity_type" "activity_type" NOT NULL,
	"note" text,
	"photo_url" text,
	"workers" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "borrowings" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" "borrowing_type" NOT NULL,
	"counterparty_name" varchar(100) NOT NULL,
	"amount" real NOT NULL,
	"interest_rate" real DEFAULT 0,
	"due_date" timestamp,
	"status" "borrowing_status" DEFAULT 'pending' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" text PRIMARY KEY NOT NULL,
	"farm_id" text NOT NULL,
	"season_id" text,
	"date" timestamp DEFAULT now() NOT NULL,
	"category" "expense_category" NOT NULL,
	"amount" real NOT NULL,
	"description" text,
	"receipt_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "farms" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" varchar(100) NOT NULL,
	"size_acre" real NOT NULL,
	"location" varchar(200) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "harvests" (
	"id" text PRIMARY KEY NOT NULL,
	"season_id" text NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL,
	"quantity" real NOT NULL,
	"unit" "harvest_unit" NOT NULL,
	"price_per_unit" real NOT NULL,
	"total_income" real NOT NULL,
	"buyer_name" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "incomes" (
	"id" text PRIMARY KEY NOT NULL,
	"farm_id" text NOT NULL,
	"season_id" text,
	"date" timestamp DEFAULT now() NOT NULL,
	"category" "income_category" NOT NULL,
	"amount" real NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory" (
	"id" text PRIMARY KEY NOT NULL,
	"farm_id" text NOT NULL,
	"item_name" varchar(100) NOT NULL,
	"category" "inventory_category" NOT NULL,
	"quantity" real NOT NULL,
	"unit" "inventory_unit" NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "otp_store" (
	"id" serial PRIMARY KEY NOT NULL,
	"phone" varchar(15) NOT NULL,
	"otp" varchar(6) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seasons" (
	"id" text PRIMARY KEY NOT NULL,
	"farm_id" text NOT NULL,
	"crop_name" varchar(100) NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"status" "season_status" DEFAULT 'active' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"phone" varchar(15),
	"username" varchar(30),
	"password_hash" text,
	"name" varchar(100) NOT NULL,
	"state" varchar(50) NOT NULL,
	"language" "language" DEFAULT 'hi' NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_phone_unique" UNIQUE("phone"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "borrowings" ADD CONSTRAINT "borrowings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farms" ADD CONSTRAINT "farms_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "harvests" ADD CONSTRAINT "harvests_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incomes" ADD CONSTRAINT "incomes_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incomes" ADD CONSTRAINT "incomes_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seasons" ADD CONSTRAINT "seasons_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;