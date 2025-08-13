# DevTools Discord Bot by RataLife

## Overview

This is a full-stack application featuring a Discord bot that provides development tools through private ticket channels. The bot helps users with various conversions including AOB/Byte format conversion, image to byte array conversion, font to byte array conversion, and source code processing. Users interact with the bot through slash commands, which create private ticket channels with interactive menus and buttons for different conversion operations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React with TypeScript**: Modern React application built with Vite for fast development and building
- **UI Components**: Comprehensive component library using shadcn/ui built on top of Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming and design consistency
- **State Management**: TanStack Query for server state management and API interactions
- **Routing**: Wouter for lightweight client-side routing
- **Build System**: Vite with custom configuration for development and production builds

### Backend Architecture
- **Node.js with Express**: RESTful API server handling bot status and ticket management endpoints
- **TypeScript**: Full TypeScript implementation for type safety across the application
- **Discord.js**: Discord bot implementation with slash commands, interactive components, and channel management
- **Session Management**: In-memory session storage for tracking user interactions and conversion states
- **Modular Services**: Separated concerns with dedicated services for ticket management and conversion operations

### Data Storage Solutions
- **PostgreSQL with Drizzle ORM**: Primary database using Neon serverless PostgreSQL for scalability
- **Schema Design**: User and ticket management with support for different ticket types and statuses
- **In-Memory Storage**: Fallback storage implementation for development and testing environments
- **Session Storage**: User interaction states stored in memory for real-time bot conversations

### Authentication and Authorization
- **Discord OAuth Integration**: Bot authentication using Discord bot tokens
- **Channel Permissions**: Private ticket channels with restricted access for ticket creators
- **Role-Based Access**: Bot has administrative permissions for channel and message management

### External Dependencies
- **Discord API**: Core integration for bot functionality, slash commands, and interactive components
- **Neon Database**: Serverless PostgreSQL hosting for production data storage
- **Replit Infrastructure**: Development environment with integrated deployment and runtime features

### Key Design Patterns
- **Service Layer Architecture**: Separated business logic into dedicated service classes (TicketService, ConversionService)
- **Command Pattern**: Discord slash commands implemented with structured command definitions and handlers
- **Factory Pattern**: Dynamic creation of Discord embeds and interactive components based on user selections
- **Repository Pattern**: Abstract storage interface allowing for multiple storage implementations (memory, database)
- **Event-Driven Architecture**: Discord event handling with centralized interaction routing and processing