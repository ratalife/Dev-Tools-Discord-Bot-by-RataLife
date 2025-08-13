# **DevTools Discord Bot by RataLife**  

## **Overview**  

This is a **full-stack application** featuring a **Discord bot** that provides **developer tools** through **private ticket channels**. The bot assists users with various conversions, including:  

- **AOB/Byte Conversion**: Switches between hexadecimal formats and byte arrays.  
- **Image to Byte Array**: Converts images into usable byte arrays for code.  
- **Font to Byte Array**: Extracts font files and converts them into byte arrays.  
- **Source Code Processing**: Analyzes and optimizes code snippets.  

Users interact via **slash commands (`/`)** that create **private ticket channels** with interactive menus and buttons for each operation.  

🔗 **Official DevTools Website**: [https://twentyfox.lat/tools.html](https://twentyfox.lat/tools.html)  

---  

## **System Architecture**  

### **🖥️ Frontend**  
- **Core Technologies**:  
  - **React + TypeScript**: Fast and type-safe development.  
  - **Vite**: Ultra-fast bundler for dev and production.  
  - **shadcn/ui**: Modern component library built on Radix UI.  
  - **Tailwind CSS**: Utility-first styling with custom CSS variables.  

- **State Management**:  
  - **TanStack Query**: Efficient API data handling.  
  - **Wouter**: Lightweight client-side routing.  

- **UI Example**:  
  ![UI Preview](https://i.ibb.co/4gF6vGbp/imagen-2025-08-13-141818952.png)  

### **⚙️ Backend**  
- **Node.js + Express**: REST API for bot status and ticket management.  
- **Discord.js**: Handles slash commands, interactive components, and channel management.  
- **In-Memory Sessions**: Tracks user conversion states.  
- **Modular Services**:  
  - `TicketService`: Manages ticket creation and closure.  
  - `ConversionService`: Handles AOB, image, font, and code conversions.  

### **🗃️ Data Storage**  
- **PostgreSQL (Neon)**: Primary database with **Drizzle ORM** for type-safe queries.  
  - **Schema**:  
    - `users` table: Discord ID, roles, preferences.  
    - `tickets` table: Type (AOB, image, etc.), status (open/closed), history.  
- **In-Memory Fallback**: Used for local development without DB dependency.  

### **🔐 Authentication & Permissions**  
- **Discord OAuth**: Bot authenticates via Discord tokens.  
- **Private Channels**: Only the user and bot can access the ticket.  
- **Role-Based Access**: The bot requires `Administrator` permissions for channel management.  

### **📚 External Dependencies**  
| Technology          | Purpose                          |  
|---------------------|----------------------------------|  
| Discord API         | Server & user interactions      |  
| Neon (PostgreSQL)   | Serverless production DB       |  

### **🛠️ Key Design Patterns**  
1. **Service Layer**: Business logic separation (e.g., `ConversionService`).  
2. **Command Pattern**: Each slash command (`/aob`, `/image`) has a dedicated handler.  
3. **Embed Factory**: Dynamically generates Discord messages based on user actions.  
4. **Repository Pattern**: Single interface for multiple storage backends (DB/memory).  
5. **Event-Driven**: Listens for Discord interactions (buttons, dropdowns).  

---  
🔧 **Want to try it?** Invite the bot to your server or visit the [official website](https://twentyfox.lat/tools.html).  

*(Preview: Bot UI in action)*  
![UI Example](https://i.ibb.co/4gF6vGbp/imagen-2025-08-13-141818952.png)