# Team Meeting App

A modern web application for managing team members who will join meetings, built with Next.js 14, MongoDB, and TypeScript. The app is designed to be future-ready for Discord.js integration.

## Features

### Current Features
- **Team Member Management**: Add, edit, and remove team members
- **Admin Panel**: Full CRUD operations for team member data
- **Meeting Management**: Create and manage meeting requests with participants
- **Drag and Drop**: Reorder participant cards in the grid layout
- **Responsive Design**: Modern UI built with Tailwind CSS and Shadcn UI
- **MongoDB Integration**: Persistent data storage with Mongoose ODM
- **TypeScript**: Full type safety throughout the application
- **Real-time Updates**: Dynamic data management with React hooks

### Future Features (Discord Integration)
- **Discord.js Integration**: Automatic user sync from Discord servers
- **Avatar Import**: Import user avatars from Discord
- **Nickname Sync**: Sync Discord nicknames and usernames
- **Real-time Status**: Display Discord online/offline status

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI, Radix UI
- **Database**: MongoDB with Mongoose ODM
- **Icons**: Lucide React
- **Drag and Drop**: @dnd-kit/core, @dnd-kit/sortable
- **Future**: Discord.js for bot integration

## Prerequisites

- Node.js 18+ 
- MongoDB (local or cloud)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd team-meeting-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` and add your MongoDB connection string:
   ```env
   MONGODB_URI=mongodb://localhost:27017/team-meeting-app
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
team-meeting-app/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   └── team-members/  # Team member CRUD endpoints
│   ├── admin/             # Admin panel page
│   ├── team-members/      # Team members display page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable UI components
│   └── ui/               # Shadcn UI components
├── lib/                  # Utility functions
│   ├── mongodb.ts        # MongoDB connection
│   └── utils.ts          # Helper functions
├── models/               # Mongoose models
│   └── TeamMember.ts     # Team member schema
└── public/               # Static assets
```

## API Endpoints

### Team Members
- `GET /api/team-members` - Get all active team members
- `POST /api/team-members` - Create a new team member
- `GET /api/team-members/[id]` - Get a specific team member
- `PUT /api/team-members/[id]` - Update a team member
- `DELETE /api/team-members/[id]` - Soft delete a team member

### Meeting Requests
- `GET /api/meeting-requests` - Get all active meeting requests
- `POST /api/meeting-requests` - Create a new meeting request
- `GET /api/meeting-requests/[id]` - Get a specific meeting request
- `PUT /api/meeting-requests/[id]` - Update a meeting request
- `PATCH /api/meeting-requests/[id]` - Update meeting status
- `PATCH /api/meeting-requests/[id]/positions` - Update participant positions (drag and drop)

## Database Schema

### TeamMember Model
```typescript
interface ITeamMember {
  name: string;           // Required
  email: string;          // Required, unique
  role: string;           // Required
  department: string;     // Required
  avatar?: string;        // Optional
  discordId?: string;     // Future Discord integration
  discordUsername?: string; // Future Discord integration
  discordNickname?: string; // Future Discord integration
  isActive: boolean;      // Soft delete flag
  joinDate: Date;         // Auto-generated
  lastUpdated: Date;      // Auto-updated
}
```

## Usage

### Viewing Team Members
1. Navigate to the home page
2. Click "View Team Members" to see all active team members
3. View member details including name, role, department, and join date

### Admin Panel
1. Click "Access Admin Panel" from the home page
2. Add new team members using the "Add Member" button
3. Edit existing members by clicking the edit icon
4. Delete members (soft delete) using the delete icon
5. View statistics and member counts

### Drag and Drop Participant Management
1. Navigate to the main page where participants are displayed
2. Click and drag any participant card to swap it with another card
3. Release to complete the swap
4. The new positions are automatically saved to the database

**Note**: Drag and drop is only enabled when there are 25 or fewer participants (5x5 grid maximum) and on larger screens where the grid layout is stable.

## Future Discord Integration

The app is designed to integrate with Discord.js for automatic user management:

### Planned Features
- **Discord Bot**: Automatically sync users from Discord server
- **Avatar Import**: Import Discord avatars automatically
- **Nickname Sync**: Keep nicknames in sync with Discord
- **Status Tracking**: Show online/offline status
- **Role Mapping**: Map Discord roles to app roles

### Integration Points
- Discord bot token configuration
- Guild (server) ID setup
- Webhook integration for real-time updates
- User permission management

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Features
1. Create new API routes in `app/api/`
2. Add new pages in `app/`
3. Create reusable components in `components/`
4. Update database models in `models/`

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
- **Netlify**: Configure build settings for Next.js
- **Railway**: Add MongoDB add-on and deploy
- **Heroku**: Use MongoDB Atlas and configure buildpacks

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the GitHub repository. 