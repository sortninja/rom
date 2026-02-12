import { LayoutDashboard, Box, Truck, Bolt, Cpu, HardHat, FileBarChart } from 'lucide-react';

export const MODULE_TYPES = {
    OPERATIONAL_DATA: 'operational_data',
    ROBOTIC_SYSTEMS: 'robotic_systems',
    STORAGE: 'storage',
    CONVEYANCE: 'conveyance',
    CONTROLS: 'controls',
    SOFTWARE: 'software',
    IMPLEMENTATION: 'implementation',
};

export const SOURCING_STRATEGIES = {
    BUYOUT: 'Buyout',
    IN_HOUSE: 'In-House',
    HYBRID: 'Hybrid'
};

export const MODULE_DEFINITIONS = [
    {
        id: MODULE_TYPES.OPERATIONAL_DATA,
        name: 'Operational Data & Requirements',
        description: 'Throughput requirements, order profiles, inventory characteristics, and operating hours.',
        icon: FileBarChart,
        required: true,
        sourcingOptions: [SOURCING_STRATEGIES.IN_HOUSE], // Always internal/consultant
        accuracy: 0.15 // Performance metrics
    },
    {
        id: MODULE_TYPES.ROBOTIC_SYSTEMS,
        name: 'Robotic Systems',
        description: 'AMRs, Articulated arms, ASRS shuttles, and charging stations.',
        icon: Cpu,
        required: false,
        sourcingOptions: [SOURCING_STRATEGIES.BUYOUT, SOURCING_STRATEGIES.IN_HOUSE],
        defaultSourcing: SOURCING_STRATEGIES.BUYOUT,
        accuracy: 0.25
    },
    {
        id: MODULE_TYPES.STORAGE,
        name: 'Storage Infrastructure',
        description: 'Racking systems, shelving, mezzanines, and structural supports.',
        icon: Box,
        required: false,
        sourcingOptions: [SOURCING_STRATEGIES.BUYOUT, SOURCING_STRATEGIES.IN_HOUSE, SOURCING_STRATEGIES.HYBRID],
        defaultSourcing: SOURCING_STRATEGIES.BUYOUT,
        accuracy: 0.25
    },
    {
        id: MODULE_TYPES.CONVEYANCE,
        name: 'Conveyance Systems',
        description: 'Powered/gravity conveyors, sortation, and fast-moving material handling.',
        icon: Truck,
        required: false,
        sourcingOptions: [SOURCING_STRATEGIES.BUYOUT, SOURCING_STRATEGIES.IN_HOUSE, SOURCING_STRATEGIES.HYBRID],
        defaultSourcing: SOURCING_STRATEGIES.BUYOUT, // Default not specified, assuming buyout mostly
        accuracy: 0.25
    },
    {
        id: MODULE_TYPES.CONTROLS,
        name: 'Controls & Electrical',
        description: 'PLC hardware, control panels, HMIs, and associated electrical work.',
        icon: Bolt,
        required: false,
        sourcingOptions: [SOURCING_STRATEGIES.IN_HOUSE, SOURCING_STRATEGIES.BUYOUT],
        defaultSourcing: SOURCING_STRATEGIES.IN_HOUSE,
        accuracy: 0.25
    },
    {
        id: MODULE_TYPES.SOFTWARE,
        name: 'Software Systems',
        description: 'WES, WCS, Fleet Management, and custom integration software.',
        icon: LayoutDashboard,
        required: false,
        sourcingOptions: [SOURCING_STRATEGIES.BUYOUT, 'Custom Development', SOURCING_STRATEGIES.HYBRID],
        defaultSourcing: SOURCING_STRATEGIES.BUYOUT, // COTS
        accuracy: 0.25
    },
    {
        id: MODULE_TYPES.IMPLEMENTATION,
        name: 'Implementation Services',
        description: 'Project management, installation, commissioning, and training.',
        icon: HardHat,
        required: true,
        sourcingOptions: [SOURCING_STRATEGIES.IN_HOUSE, 'Subcontractor', SOURCING_STRATEGIES.HYBRID],
        defaultSourcing: SOURCING_STRATEGIES.IN_HOUSE,
        accuracy: 0.30 // Timeline accuracy
    }
];
