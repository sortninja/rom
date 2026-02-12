# ROM (Requirements and Operations Management) System

A comprehensive web application for planning and managing warehouse automation projects. Built with React, Vite, and modern web technologies.

## 🚀 Features

- **Module Selection**: Interactive selection of warehouse automation components
- **Configuration Management**: Dynamic forms for each module type with real-time cost estimation
- **Sourcing Strategy**: Choose between Buyout, In-House, or Hybrid approaches
- **Project Export**: Generate JSON/CSV reports with cost breakdowns
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 📋 Supported Modules

- **Operational Data & Requirements**: Throughput, operating hours, inventory management
- **Robotic Systems**: AMRs, Articulated Arms, ASRS with fleet management
- **Conveyance Systems**: MDR, Gravity, and Powered Belt conveyors
- **Storage Infrastructure**: Selective Racking, Push Back, Drive-In storage

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, React Router
- **State Management**: React Context API with useReducer
- **Styling**: CSS Variables, Utility Classes, Responsive Design
- **Icons**: Lucide React
- **Build Tool**: Vite with Hot Module Replacement

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🧰 Running on an LXC

For an Ubuntu LXC setup (no Docker), including how to bind Vite to `0.0.0.0` so it is reachable from your LAN, see [`rom/docs/LXC.md`](docs/LXC.md:1).

## 📖 Documentation

For detailed documentation, see [ROM_SYSTEM_DOCUMENTATION.md](ROM_SYSTEM_DOCUMENTATION.md)

## 🎯 Usage

1. **Module Selection**: Navigate to Modules page and select required components
2. **Configuration**: Configure each selected module with specific parameters
3. **Cost Estimation**: View real-time cost calculations as you configure
4. **Export**: Generate reports in JSON or CSV format for further analysis

## 💡 Key Features Implemented

- ✅ Interactive module selection with sourcing strategies
- ✅ Dynamic configuration forms for each module type
- ✅ Real-time cost estimation and breakdown
- ✅ Global state management with data persistence
- ✅ Export functionality (JSON and CSV formats)
- ✅ Responsive and professional UI design
- ✅ Comprehensive documentation

## 🔧 Development

The application follows modern React patterns with:
- Component-based architecture
- Global state management via Context API
- Modular form components
- Reusable UI components
- Professional styling with CSS variables

## 📊 Cost Estimation

The system provides accurate cost estimates based on:
- Industry-standard pricing for automation equipment
- Configuration parameters (quantity, size, type)
- Sourcing strategy considerations
- Integration and labor costs

## 🔄 Data Flow

1. User selects modules and sourcing strategies
2. Configuration data is stored in global state
3. Cost calculations update in real-time
4. Export functionality generates comprehensive reports

## 🎨 UI/UX Features

- Clean, professional interface with industrial tech aesthetic
- Intuitive navigation with collapsible sidebar
- Responsive design for various screen sizes
- Interactive forms with validation-ready structure
- Real-time feedback and status indicators

## 🔮 Future Enhancements

- Form validation and error handling
- Backend integration for data persistence
- Advanced reporting with charts and analytics
- User authentication and project management
- Template system for common configurations

---

**ROM System** - Empowering warehouse automation planning with intelligent tools and comprehensive insights.
