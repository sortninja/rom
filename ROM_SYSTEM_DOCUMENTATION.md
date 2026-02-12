# ROM (Requirements and Operations Management) System

## Overview

The ROM system is a comprehensive web application designed for planning and managing warehouse automation projects. It provides a modular approach to selecting, configuring, and estimating costs for various warehouse automation components.

## Features

### 1. Module Selection
- **Interactive Module Cards**: Visual cards for each module type with icons and descriptions
- **Sourcing Strategy**: Choose between Buyout, In-House, or Hybrid approaches for each module
- **Real-time Statistics**: Live count of selected modules and sourcing distribution
- **Required Modules**: Automatic selection of mandatory modules like Operational Data

### 2. Configuration Management
- **Dynamic Forms**: Context-specific forms for each module type
- **Data Persistence**: All configuration data is stored in global state
- **Cost Calculations**: Real-time cost estimation based on configuration inputs
- **Multi-module Support**: Tabbed interface for configuring multiple selected modules

### 3. Module Types Supported

#### Operational Data & Requirements
- Throughput requirements (peak/average units per hour, daily order volume)
- Operating hours (shifts per day, hours per shift, days per week)
- Inventory characteristics (total SKUs, active SKUs, storage volume)

#### Robotic Systems
- Robot fleet management with dynamic table
- Support for AMRs, Articulated Arms, and ASRS Shuttles
- Vendor tracking and unit cost management
- Automatic total cost calculation

#### Conveyance Systems
- Conveyor segment configuration
- Support for MDR, Gravity, and other conveyor types
- Length-based cost estimation
- Zone configuration

#### Storage Infrastructure
- Storage zone management
- Support for Selective Racking, Push Back, and other storage types
- Position-based cost estimation
- Height and aisle width configuration

### 4. Project Export & Reporting
- **JSON Export**: Complete project data export with all configurations
- **CSV Export**: Summary report in CSV format for spreadsheet analysis
- **Cost Estimation**: Automated cost calculation with breakdown by module
- **Project Overview**: Summary of project details and sourcing strategy

## Technical Architecture

### Frontend Stack
- **React 19**: Modern React with hooks and context
- **Vite**: Fast build tool and development server
- **React Router**: Client-side routing with nested routes
- **Lucide React**: Icon library for consistent UI icons

### State Management
- **Context API**: Global state management using React Context
- **useReducer**: Complex state logic with reducer pattern
- **Module Data Storage**: Centralized storage for all module configurations

### Styling
- **CSS Variables**: Consistent design system with CSS custom properties
- **Utility Classes**: Reusable CSS classes for common patterns
- **Responsive Design**: Flexible layouts that work on different screen sizes

### Key Components

#### Layout Components
- `MainLayout`: Main application layout with header and sidebar
- `Header`: Top navigation with project title and user actions
- `Sidebar`: Collapsible navigation menu with module access

#### Module Components
- `ModuleCard`: Reusable card component for module selection
- `ModuleSelection`: Page for selecting and configuring modules
- `Configuration`: Page for detailed module configuration

#### Form Components
- `OperationalDataForm`: Form for operational data input
- `RoboticSystemsForm`: Dynamic table for robot fleet management
- `ConveyanceSystemsForm`: Conveyor segment configuration
- `StorageInfrastructureForm`: Storage zone management

#### Utility Components
- `ProjectExport`: Export functionality and project summary

## Data Model

### Project State Structure
```javascript
{
  projectInfo: {
    name: string,
    lead: string,
    status: string
  },
  modules: {
    [moduleId]: {
      id: string,
      selected: boolean,
      sourcing: string
    }
  },
  moduleData: {
    [moduleId]: {
      // Module-specific configuration data
    }
  },
  assumptions: [],
  requirements: []
}
```

### Module Definitions
Each module has:
- Unique ID and name
- Description and icon
- Required/optional status
- Available sourcing strategies
- Default sourcing strategy
- Accuracy metrics

## Usage Guide

### Getting Started
1. Navigate to the **Modules** page
2. Select the modules required for your project
3. Choose sourcing strategies for each module
4. Click on **Configuration** to configure each module
5. Fill in the required data for each selected module
6. Use **Export** to generate reports and export data

### Module Selection
- Click on module cards to select/deselect them
- Required modules are automatically selected
- Choose sourcing strategy from available options
- View real-time statistics of selected modules

### Configuration
- Navigate between modules using the sidebar
- Fill in all required fields for accurate cost estimation
- Use the Save button to persist configuration data
- Cost estimates update automatically based on inputs

### Export & Reporting
- Click **Export JSON** for complete project data
- Click **Export CSV** for summary spreadsheet
- View cost breakdown and project overview
- Download reports with timestamped filenames

## Development

### Setup
```bash
npm install
npm run dev
```

### Build
```bash
npm run build
```

### Project Structure
```
src/
├── components/
│   ├── layout/         # Layout components
│   ├── modules/        # Module-specific forms
│   └── ProjectExport.jsx
├── context/            # Global state management
├── data/               # Module definitions and constants
├── pages/              # Page components
└── App.jsx            # Main application component
```

## Future Enhancements

### Planned Features
- **Validation**: Form validation and error handling
- **Authentication**: User login and project permissions
- **Backend Integration**: Database persistence and API integration
- **Advanced Reporting**: More detailed cost analysis and charts
- **Template System**: Pre-configured module templates
- **Collaboration**: Multi-user project collaboration
- **Version Control**: Project history and version tracking

### Technical Improvements
- **TypeScript**: Add type safety with TypeScript
- **Testing**: Unit and integration tests
- **Performance**: Optimize for large projects
- **Accessibility**: WCAG compliance
- **Internationalization**: Multi-language support

## Cost Estimation Logic

### Robotic Systems
- AMR: $35,000 base cost per unit
- Articulated Arm: Varies by vendor
- ASRS Shuttle: Varies by vendor
- Integration labor: 15-25% of hardware cost

### Conveyance Systems
- MDR: $350 per foot
- Gravity: $100 per foot
- Powered Belt: $500 per foot

### Storage Infrastructure
- Selective Racking: $60 per pallet position
- Push Back: $120 per pallet position
- Drive-In: $40 per pallet position

## Support

For issues, questions, or contributions, please refer to the project repository or contact the development team.

## License

This project is part of the ROM system development and is intended for warehouse automation planning purposes.