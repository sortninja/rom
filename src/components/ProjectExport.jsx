import React from 'react';
import { useProject } from '../context/ProjectContext';
import { MODULE_DEFINITIONS } from '../data/modules';
 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/src/components/ProjectExport.jsx b/src/components/ProjectExport.jsx
index 2f67c745790e0d186c2ca3ff66a3c88aaaa04909..77309cc91ec951a8820b77c4686e5ab7b7aaf34d 100644
--- a/src/components/ProjectExport.jsx
+++ b/src/components/ProjectExport.jsx
@@ -1,28 +1,29 @@
 import React from 'react';
 import { useProject } from '../context/ProjectContext';
 import { MODULE_DEFINITIONS } from '../data/modules';
+import { calculateConveyanceHardwareCost, calculateRoboticsHardwareCost } from '../utils/costs';
 import { Download, FileText } from 'lucide-react';
 
 export default function ProjectExport() {
     const { state } = useProject();
     const { projectInfo, modules, moduleData, assumptions, requirements, requirementsDocument } = state;
 
     const generateProjectSummary = () => {
         const selectedModules = MODULE_DEFINITIONS.filter(m => modules[m.id]);
 
         const summary = {
             projectInfo,
             selectedModules: selectedModules.map(module => ({
                 id: module.id,
                 name: module.name,
                 sourcing: modules[module.id]?.sourcing,
                 data: moduleData[module.id] || {}
             })),
             totalModules: selectedModules.length,
             assumptions,
             requirements,
             requirementsDocument,
             sourcingBreakdown: {
                 buyout: selectedModules.filter(m => modules[m.id]?.sourcing === 'Buyout').length,
                 inHouse: selectedModules.filter(m => modules[m.id]?.sourcing === 'In-House').length,
                 hybrid: selectedModules.filter(m => modules[m.id]?.sourcing === 'Hybrid').length
@@ -54,62 +55,58 @@ export default function ProjectExport() {
         selectedModules.forEach(module => {
             const sourcing = modules[module.id]?.sourcing || 'Not specified';
             const hasData = moduleData[module.id] && Object.keys(moduleData[module.id]).length > 0;
             const status = hasData ? 'Configured' : 'Pending Configuration';
             const notes = module.required ? 'Required module' : 'Optional module';
 
             csvContent += `"${module.name}","${sourcing}","${status}","${notes}"\n`;
         });
 
         const dataBlob = new Blob([csvContent], { type: 'text/csv' });
         const url = URL.createObjectURL(dataBlob);
         const link = document.createElement('a');
         link.href = url;
         link.download = `${projectInfo.name.replace(/\s+/g, '_')}_ROM_Summary_${new Date().toISOString().split('T')[0]}.csv`;
         link.click();
 
         URL.revokeObjectURL(url);
     };
 
     const generateCostEstimate = () => {
         let totalCost = 0;
         const costBreakdown = {};
 
         // Robotic Systems Cost
         if (moduleData.robotic_systems?.robots) {
-            const robotCost = moduleData.robotic_systems.robots.reduce((sum, robot) =>
-                sum + (robot.quantity * robot.unitCost), 0);
+            const robotCost = calculateRoboticsHardwareCost(moduleData.robotic_systems.robots);
             totalCost += robotCost;
             costBreakdown.robotic_systems = robotCost;
         }
 
         // Conveyance Systems Cost
         if (moduleData.conveyance?.segments) {
-            const conveyanceCost = moduleData.conveyance.segments.reduce((sum, segment) => {
-                const costPerFoot = segment.type === 'MDR' ? 350 : segment.type === 'Gravity' ? 100 : 500;
-                return sum + (segment.length * costPerFoot);
-            }, 0);
+            const conveyanceCost = calculateConveyanceHardwareCost(moduleData.conveyance.segments);
             totalCost += conveyanceCost;
             costBreakdown.conveyance = conveyanceCost;
         }
 
         // Storage Infrastructure Cost
         if (moduleData.storage?.zones) {
             const storageCost = moduleData.storage.zones.reduce((sum, zone) => {
                 const costPerPos = zone.type === 'Selective Racking' ? 60 : zone.type === 'Push Back' ? 120 : 40;
                 return sum + (zone.positions * costPerPos);
             }, 0);
             totalCost += storageCost;
             costBreakdown.storage = storageCost;
         }
 
         // Controls & Electrical Cost
         if (moduleData.controls?.panels) {
             const controlsCost = moduleData.controls.panels.reduce((sum, panel) =>
                 sum + (panel.quantity * panel.unitCost), 0);
             totalCost += controlsCost;
             costBreakdown.controls = controlsCost;
         }
 
         // Software Systems Cost
         if (moduleData.software?.applications) {
             const softwareCost = moduleData.software.applications.reduce((sum, application) =>
diff --git a/src/components/modules/ConveyanceSystemsForm.jsx b/src/components/modules/ConveyanceSystemsForm.jsx
index f3308b1d18e7960fa7799e6ae02ef11cbecdf616..89de63f0866cb6417354a317d0d1fec7153209c4 100644
--- a/src/components/modules/ConveyanceSystemsForm.jsx
+++ b/src/components/modules/ConveyanceSystemsForm.jsx
@@ -1,157 +1,243 @@
 import React, { useState } from 'react';
 import { useProject } from '../../context/ProjectContext';
-import { Save, Plus, Trash2 } from 'lucide-react';
+import { Save, Plus, Trash2, AlertCircle } from 'lucide-react';
+import { calculateConveyanceHardwareCost, calculateConveyanceSegmentCost } from '../../utils/costs';
+import { toNumber, validateConveyanceSegments } from '../../utils/validation';
+
+function hasValidationErrors(validationErrors = []) {
+    return validationErrors.some((rowError) => rowError && Object.keys(rowError).length > 0);
+}
 
 export default function ConveyanceSystemsForm() {
-    const { state } = useProject();
-    const moduleConfig = state.modules['conveyance'];
+    const { state, dispatch } = useProject();
+    const [errors, setErrors] = useState([]);
+
+    const moduleConfig = state.modules.conveyance;
     const sourcing = moduleConfig?.sourcing || 'Buyout';
+    const moduleData = state.moduleData.conveyance || {
+        segments: [{ id: 1, type: 'MDR', length: 100, width: 24, zones: 10 }]
+    };
 
-    const [segments, setSegments] = useState([
-        { id: 1, type: 'MDR', length: 100, width: 24, zones: 10 },
-    ]);
+    const segments = moduleData.segments;
+
+    const updateModuleData = (newData) => {
+        dispatch({
+            type: 'SET_MODULE_DATA',
+            payload: {
+                moduleId: 'conveyance',
+                data: newData
+            }
+        });
+    };
 
     const addSegment = () => {
-        setSegments([...segments, { id: Date.now(), type: 'MDR', length: 10, width: 24, zones: 1 }]);
+        const updatedSegments = [...segments, { id: Date.now(), type: 'MDR', length: 10, width: 24, zones: 1 }];
+        updateModuleData({ segments: updatedSegments });
+
+        if (hasValidationErrors(errors)) {
+            setErrors(validateConveyanceSegments(updatedSegments));
+        }
     };
 
     const removeSegment = (id) => {
-        setSegments(segments.filter(s => s.id !== id));
+        const updatedSegments = segments.filter((segment) => segment.id !== id);
+        updateModuleData({ segments: updatedSegments });
+
+        if (hasValidationErrors(errors)) {
+            setErrors(validateConveyanceSegments(updatedSegments));
+        }
     };
 
     const updateSegment = (id, field, value) => {
-        setSegments(segments.map(s => s.id === id ? { ...s, [field]: value } : s));
+        const updatedSegments = segments.map((segment) => (
+            segment.id === id ? { ...segment, [field]: value } : segment
+        ));
+
+        updateModuleData({ segments: updatedSegments });
+
+        if (hasValidationErrors(errors)) {
+            setErrors(validateConveyanceSegments(updatedSegments));
+        }
     };
 
-    const totalLength = segments.reduce((sum, s) => sum + s.length, 0);
-    // Rough estimation logic for demo
-    const estimatedCost = segments.reduce((sum, s) => {
-        const costPerFoot = s.type === 'MDR' ? 350 : s.type === 'Gravity' ? 100 : 500;
-        return sum + (s.length * costPerFoot);
+    const handleSave = () => {
+        const validationErrors = validateConveyanceSegments(segments);
+
+        if (hasValidationErrors(validationErrors)) {
+            setErrors(validationErrors);
+            return;
+        }
+
+        setErrors([]);
+        updateModuleData({ segments });
+
+    };
+
+    const totalLength = segments.reduce((sum, segment) => {
+        const length = toNumber(segment.length);
+        return sum + (Number.isFinite(length) ? Math.max(0, length) : 0);
     }, 0);
+    const estimatedCost = calculateConveyanceHardwareCost(segments);
 
     return (
         <div className="card">
             <div className="flex justify-between items-center mb-6">
                 <div>
                     <h2 className="text-h2">Conveyance Systems</h2>
                     <span className="text-small" style={{
                         background: 'var(--color-bg-body)',
                         padding: '4px 8px',
                         borderRadius: '4px',
                         border: '1px solid var(--color-border)'
                     }}>
                         Strategy: <strong>{sourcing}</strong>
                     </span>
                 </div>
-                <button className="flex items-center gap-md" style={{
-                    background: 'var(--color-primary)',
-                    color: 'white',
-                    border: 'none',
-                    padding: 'var(--space-sm) var(--space-md)',
-                    borderRadius: 'var(--radius-md)'
-                }}>
+                <button
+                    onClick={handleSave}
+                    className="flex items-center gap-md"
+                    style={{
+                        background: 'var(--color-primary)',
+                        color: 'white',
+                        border: 'none',
+                        padding: 'var(--space-sm) var(--space-md)',
+                        borderRadius: 'var(--radius-md)'
+                    }}
+                >
                     <Save size={20} />
                     Save
                 </button>
             </div>
 
+            {hasValidationErrors(errors) && (
+                <div style={{
+                    display: 'flex',
+                    alignItems: 'center',
+                    gap: 'var(--space-sm)',
+                    marginBottom: 'var(--space-md)',
+                    color: 'var(--color-danger)'
+                }}>
+                    <AlertCircle size={16} />
+                    <span className="text-small" style={{ color: 'var(--color-danger)' }}>
+                        Please resolve validation errors before saving.
+                    </span>
+                </div>
+            )}
+
             <div className="mb-6">
                 <h3 className="text-h2" style={{ fontSize: '1.25rem', marginBottom: 'var(--space-md)' }}>Conveyor Segments</h3>
 
                 <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                     <thead>
                         <tr style={{ background: 'var(--color-bg-body)', color: 'var(--color-text-muted)', textAlign: 'left' }}>
                             <th style={{ padding: 'var(--space-sm)' }}>Type</th>
                             <th style={{ padding: 'var(--space-sm)' }}>Width (in)</th>
                             <th style={{ padding: 'var(--space-sm)' }}>Length (ft)</th>
                             <th style={{ padding: 'var(--space-sm)' }}>Zones</th>
                             <th style={{ padding: 'var(--space-sm)' }}>Est. Cost</th>
                             <th style={{ padding: 'var(--space-sm)' }}>Actions</th>
                         </tr>
                     </thead>
                     <tbody>
-                        {segments.map(segment => (
-                            <tr key={segment.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
-                                <td style={{ padding: 'var(--space-sm)' }}>
-                                    <select
-                                        value={segment.type}
-                                        onChange={(e) => updateSegment(segment.id, 'type', e.target.value)}
-                                        style={{ padding: '4px', width: '100%' }}
-                                    >
-                                        <option value="MDR">24V MDR (Zero Pressure)</option>
-                                        <option value="Belt">Belt Conveyor (Transport)</option>
-                                        <option value="Gravity">Gravity Roller</option>
-                                        <option value="Sortation">Shoe Sorter</option>
-                                    </select>
-                                </td>
-                                <td style={{ padding: 'var(--space-sm)' }}>
-                                    <select
-                                        value={segment.width}
-                                        onChange={(e) => updateSegment(segment.id, 'width', Number(e.target.value))}
-                                        style={{ padding: '4px', width: '100%' }}
-                                    >
-                                        <option value="18">18"</option>
-                                        <option value="24">24"</option>
-                                        <option value="30">30"</option>
-                                    </select>
-                                </td>
-                                <td style={{ padding: 'var(--space-sm)' }}>
-                                    <input
-                                        type="number"
-                                        value={segment.length}
-                                        onChange={(e) => updateSegment(segment.id, 'length', Number(e.target.value))}
-                                        style={{ padding: '4px', width: '80px' }}
-                                    />
-                                </td>
-                                <td style={{ padding: 'var(--space-sm)' }}>
-                                    <input
-                                        type="number"
-                                        value={segment.zones}
-                                        onChange={(e) => updateSegment(segment.id, 'zones', Number(e.target.value))}
-                                        style={{ padding: '4px', width: '80px' }}
-                                    />
-                                </td>
-                                <td style={{ padding: 'var(--space-sm)' }}>
-                                    ${(segment.length * (segment.type === 'MDR' ? 350 : segment.type === 'Gravity' ? 100 : 500)).toLocaleString()}
-                                </td>
-                                <td style={{ padding: 'var(--space-sm)' }}>
-                                    <button onClick={() => removeSegment(segment.id)} style={{ color: 'var(--color-danger)', border: 'none', background: 'none' }}>
-                                        <Trash2 size={16} />
-                                    </button>
-                                </td>
-                            </tr>
-                        ))}
+                        {segments.map((segment, index) => {
+                            const rowError = errors[index] || {};
+
+                            return (
+                                <tr key={segment.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
+                                    <td style={{ padding: 'var(--space-sm)' }}>
+                                        <select
+                                            value={segment.type}
+                                            onChange={(e) => updateSegment(segment.id, 'type', e.target.value)}
+                                            style={{ padding: '4px', width: '100%' }}
+                                        >
+                                            <option value="MDR">24V MDR (Zero Pressure)</option>
+                                            <option value="Belt">Belt Conveyor (Transport)</option>
+                                            <option value="Gravity">Gravity Roller</option>
+                                            <option value="Sortation">Shoe Sorter</option>
+                                        </select>
+                                    </td>
+                                    <td style={{ padding: 'var(--space-sm)' }}>
+                                        <select
+                                            value={segment.width}
+                                            onChange={(e) => updateSegment(segment.id, 'width', Number(e.target.value))}
+                                            style={{ padding: '4px', width: '100%' }}
+                                        >
+                                            <option value="18">18"</option>
+                                            <option value="24">24"</option>
+                                            <option value="30">30"</option>
+                                        </select>
+                                    </td>
+                                    <td style={{ padding: 'var(--space-sm)' }}>
+                                        <input
+                                            type="number"
+                                            value={segment.length}
+                                            onChange={(e) => updateSegment(segment.id, 'length', e.target.value)}
+                                            style={{
+                                                padding: '4px',
+                                                width: '80px',
+                                                borderColor: rowError.length ? 'var(--color-danger)' : undefined
+                                            }}
+                                        />
+                                        {rowError.length && (
+                                            <span className="text-small" style={{ color: 'var(--color-danger)' }}>{rowError.length}</span>
+                                        )}
+                                    </td>
+                                    <td style={{ padding: 'var(--space-sm)' }}>
+                                        <input
+                                            type="number"
+                                            value={segment.zones}
+                                            onChange={(e) => updateSegment(segment.id, 'zones', e.target.value)}
+                                            style={{
+                                                padding: '4px',
+                                                width: '80px',
+                                                borderColor: rowError.zones ? 'var(--color-danger)' : undefined
+                                            }}
+                                        />
+                                        {rowError.zones && (
+                                            <span className="text-small" style={{ color: 'var(--color-danger)' }}>{rowError.zones}</span>
+                                        )}
+                                    </td>
+                                    <td style={{ padding: 'var(--space-sm)' }}>
+                                        ${calculateConveyanceSegmentCost(segment).toLocaleString()}
+                                    </td>
+                                    <td style={{ padding: 'var(--space-sm)' }}>
+                                        <button onClick={() => removeSegment(segment.id)} style={{ color: 'var(--color-danger)', border: 'none', background: 'none' }}>
+                                            <Trash2 size={16} />
+                                        </button>
+                                    </td>
+                                </tr>
+                            );
+                        })}
                     </tbody>
                 </table>
 
                 <button
                     onClick={addSegment}
                     className="flex items-center gap-xs mt-md"
                     style={{
                         color: 'var(--color-primary)',
                         background: 'none',
                         border: '1px dashed var(--color-primary)',
                         padding: '8px 16px',
                         borderRadius: '4px',
                         width: '100%',
                         justifyContent: 'center'
                     }}
                 >
                     <Plus size={16} /> Add Segment
                 </button>
             </div>
 
             <div style={{ padding: 'var(--space-md)', background: 'var(--color-bg-body)', borderRadius: 'var(--radius-md)' }}>
                 <div className="flex justify-between items-center mb-sm">
                     <span>Total Length:</span>
-                    <strong>{totalLength} ft</strong>
+                    <strong>{totalLength.toLocaleString()} ft</strong>
                 </div>
                 <div className="flex justify-between items-center">
                     <span>Estimated Hardware Cost:</span>
                     <strong className="text-h2" style={{ fontSize: '1.5rem' }}>${estimatedCost.toLocaleString()}</strong>
                 </div>
             </div>
         </div>
     );
 }
diff --git a/src/components/modules/RoboticSystemsForm.jsx b/src/components/modules/RoboticSystemsForm.jsx
index d227c92da82ffdee6473a8787901c039e7a80af5..1de0400dc8bbbe1af5189728f354dffe4b3fa9be 100644
--- a/src/components/modules/RoboticSystemsForm.jsx
+++ b/src/components/modules/RoboticSystemsForm.jsx
@@ -28,51 +28,50 @@ export default function RoboticSystemsForm() {
     };
 
     const addRobot = () => {
         const newRobot = { id: Date.now(), type: 'AMR', quantity: 1, vendor: '', unitCost: 0 };
         updateModuleData({ robots: [...robots, newRobot] });
     };
 
     const removeRobot = (id) => {
         updateModuleData({ robots: robots.filter(r => r.id !== id) });
     };
 
     const updateRobot = (id, field, value) => {
         const updatedRobots = robots.map(r => r.id === id ? { ...r, [field]: value } : r);
         updateModuleData({ robots: updatedRobots });
     };
 
     const handleSave = () => {
         const validationErrors = validateRobotFleet(robots);
 
         if (validationErrors.some(Boolean)) {
             setRowErrors(validationErrors);
             return;
         }
 
         setRowErrors([]);
-        console.log('Robotic systems data saved:', { robots });
     };
 
     const totalHardwareCost = calculateRoboticsHardwareCost(robots);
 
     return (
         <div className="card">
             <div className="flex justify-between items-center mb-6">
                 <div>
                     <h2 className="text-h2">Robotic Systems</h2>
                     <span className="text-small" style={{
                         background: 'var(--color-bg-body)',
                         padding: '4px 8px',
                         borderRadius: '4px',
                         border: '1px solid var(--color-border)'
                     }}>
                         Strategy: <strong>{sourcing}</strong>
                     </span>
                 </div>
                 <button
                     onClick={handleSave}
                     className="flex items-center gap-md"
                     style={{
                         background: 'var(--color-primary)',
                         color: 'white',
                         border: 'none',
diff --git a/src/utils/costs.js b/src/utils/costs.js
index 1eaf5e1c5de63475535491685519ce17d5ade4fc..da926ab2fa993ba364c3cc839636d4cb46c55a72 100644
--- a/src/utils/costs.js
+++ b/src/utils/costs.js
@@ -1,13 +1,30 @@
 import { toNumber } from './validation.js';
 
 export function calculateRoboticsHardwareCost(robots = []) {
   return robots.reduce((total, robot) => {
     const quantity = toNumber(robot.quantity);
     const unitCost = toNumber(robot.unitCost);
 
     const safeQuantity = Number.isFinite(quantity) ? Math.max(0, quantity) : 0;
     const safeUnitCost = Number.isFinite(unitCost) ? Math.max(0, unitCost) : 0;
 
     return total + safeQuantity * safeUnitCost;
   }, 0);
 }
+
+export function getConveyanceCostPerFoot(type) {
+  if (type === 'MDR') return 350;
+  if (type === 'Gravity') return 100;
+  return 500;
+}
+
+export function calculateConveyanceSegmentCost(segment = {}) {
+  const length = toNumber(segment.length);
+  const safeLength = Number.isFinite(length) ? Math.max(0, length) : 0;
+
+  return safeLength * getConveyanceCostPerFoot(segment.type);
+}
+
+export function calculateConveyanceHardwareCost(segments = []) {
+  return segments.reduce((total, segment) => total + calculateConveyanceSegmentCost(segment), 0);
+}
diff --git a/src/utils/validation.js b/src/utils/validation.js
index d5b5978c1a7e1382eedc3e7e79491a319ed57da0..bad3456c9560d17e4c0cc6e28e40841e77400adf 100644
--- a/src/utils/validation.js
+++ b/src/utils/validation.js
@@ -48,25 +48,49 @@ export function validateRobotFleet(robots = []) {
 
   robots.forEach((robot, index) => {
     const rowErrors = {};
     const quantity = toNumber(robot.quantity);
     const unitCost = toNumber(robot.unitCost);
 
     if (!robot.vendor || robot.vendor.trim().length === 0) {
       rowErrors.vendor = 'Vendor is required.';
     }
 
     if (!Number.isInteger(quantity) || quantity < 1) {
       rowErrors.quantity = 'Quantity must be a whole number greater than 0.';
     }
 
     if (!Number.isFinite(unitCost) || unitCost < 0) {
       rowErrors.unitCost = 'Unit cost must be 0 or greater.';
     }
 
     if (Object.keys(rowErrors).length > 0) {
       errors[index] = rowErrors;
     }
   });
 
   return errors;
 }
+
+export function validateConveyanceSegments(segments = []) {
+  const errors = [];
+
+  segments.forEach((segment, index) => {
+    const rowErrors = {};
+    const length = toNumber(segment.length);
+    const zones = toNumber(segment.zones);
+
+    if (!Number.isInteger(length) || length < 1) {
+      rowErrors.length = 'Length must be a whole number greater than 0.';
+    }
+
+    if (!Number.isInteger(zones) || zones < 1) {
+      rowErrors.zones = 'Zones must be a whole number greater than 0.';
+    }
+
+    if (Object.keys(rowErrors).length > 0) {
+      errors[index] = rowErrors;
+    }
+  });
+
+  return errors;
+}
diff --git a/tests/validation.test.js b/tests/validation.test.js
index 5408053e6cb4af35e20c8fad5802e9870c595e39..d4d99cc40e091eff4d28ad9c65c43a21097df746 100644
--- a/tests/validation.test.js
+++ b/tests/validation.test.js
@@ -1,46 +1,102 @@
 import test from 'node:test';
 import assert from 'node:assert/strict';
 
-import { validateOperationalData, validateRobotFleet } from '../src/utils/validation.js';
-import { calculateRoboticsHardwareCost } from '../src/utils/costs.js';
+import {
+  validateOperationalData,
+  validateRobotFleet,
+  validateConveyanceSegments,
+} from '../src/utils/validation.js';
+import {
+  calculateRoboticsHardwareCost,
+  calculateConveyanceHardwareCost,
+  calculateConveyanceSegmentCost,
+} from '../src/utils/costs.js';
 
 test('validateOperationalData accepts valid payload', () => {
   const errors = validateOperationalData({
     throughput: { peakUnitsPerHour: 1000, averageUnitsPerHour: 800 },
     operatingHours: { shiftsPerDay: 2, daysPerWeek: 5 },
   });
 
   assert.deepEqual(errors, {});
 });
 
 test('validateOperationalData rejects average greater than peak', () => {
   const errors = validateOperationalData({
     throughput: { peakUnitsPerHour: 500, averageUnitsPerHour: 700 },
     operatingHours: { shiftsPerDay: 2, daysPerWeek: 5 },
   });
 
   assert.equal(
     errors.averageUnitsPerHour,
     'Average units/hour cannot be greater than peak units/hour.'
   );
 });
 
 test('validateRobotFleet enforces required vendor and positive quantity', () => {
   const errors = validateRobotFleet([
     { id: 1, vendor: '', quantity: 0, unitCost: -1 },
   ]);
 
   assert.equal(errors[0].vendor, 'Vendor is required.');
   assert.equal(errors[0].quantity, 'Quantity must be a whole number greater than 0.');
   assert.equal(errors[0].unitCost, 'Unit cost must be 0 or greater.');
 });
 
+test('validateConveyanceSegments enforces positive integer length and zones', () => {
+  const errors = validateConveyanceSegments([
+    { id: 1, length: 0, zones: 0 },
+  ]);
+
+  assert.equal(errors[0].length, 'Length must be a whole number greater than 0.');
+  assert.equal(errors[0].zones, 'Zones must be a whole number greater than 0.');
+});
+
+
+test('validateConveyanceSegments accepts valid whole-number inputs', () => {
+  const errors = validateConveyanceSegments([
+    { id: 1, length: '15', zones: '4' },
+  ]);
+
+  assert.deepEqual(errors, []);
+});
+
+test('validateConveyanceSegments rejects non-integer lengths', () => {
+  const errors = validateConveyanceSegments([
+    { id: 1, length: 10.5, zones: 2 },
+  ]);
+
+  assert.equal(errors[0].length, 'Length must be a whole number greater than 0.');
+});
+
 test('calculateRoboticsHardwareCost sums valid rows and ignores invalid numerics', () => {
   const total = calculateRoboticsHardwareCost([
     { quantity: 2, unitCost: 1000 },
     { quantity: '3', unitCost: '500' },
     { quantity: 'abc', unitCost: 100 },
   ]);
 
   assert.equal(total, 3500);
 });
+
+test('calculateConveyanceSegmentCost sanitizes invalid numeric lengths', () => {
+  const total = calculateConveyanceSegmentCost({ type: 'MDR', length: 'abc' });
+
+  assert.equal(total, 0);
+});
+
+test('calculateConveyanceSegmentCost applies type-specific rates', () => {
+  assert.equal(calculateConveyanceSegmentCost({ type: 'MDR', length: 2 }), 700);
+  assert.equal(calculateConveyanceSegmentCost({ type: 'Gravity', length: 2 }), 200);
+  assert.equal(calculateConveyanceSegmentCost({ type: 'Sortation', length: 2 }), 1000);
+});
+
+test('calculateConveyanceHardwareCost sums lengths by segment type and ignores invalid numerics', () => {
+  const total = calculateConveyanceHardwareCost([
+    { type: 'MDR', length: 10 },
+    { type: 'Gravity', length: '20' },
+    { type: 'Sortation', length: 'abc' },
+  ]);
+
+  assert.equal(total, 5500);
+});
 
EOF
)
import { Download, FileText } from 'lucide-react';

export default function ProjectExport() {
    const { state } = useProject();
    const { projectInfo, modules, moduleData, assumptions, requirements, requirementsDocument } = state;

    const generateProjectSummary = () => {
        const selectedModules = MODULE_DEFINITIONS.filter(m => modules[m.id]);

        const summary = {
            projectInfo,
            selectedModules: selectedModules.map(module => ({
                id: module.id,
                name: module.name,
                sourcing: modules[module.id]?.sourcing,
                data: moduleData[module.id] || {}
            })),
            totalModules: selectedModules.length,
            assumptions,
            requirements,
            requirementsDocument,
            sourcingBreakdown: {
                buyout: selectedModules.filter(m => modules[m.id]?.sourcing === 'Buyout').length,
                inHouse: selectedModules.filter(m => modules[m.id]?.sourcing === 'In-House').length,
                hybrid: selectedModules.filter(m => modules[m.id]?.sourcing === 'Hybrid').length
            }
        };

        return summary;
    };

    const exportToJSON = () => {
        const summary = generateProjectSummary();
        const dataStr = JSON.stringify(summary, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });

        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${projectInfo.name.replace(/\s+/g, '_')}_ROM_Export_${new Date().toISOString().split('T')[0]}.json`;
        link.click();

        URL.revokeObjectURL(url);
    };

    const exportToCSV = () => {
        const selectedModules = MODULE_DEFINITIONS.filter(m => modules[m.id]);

        let csvContent = 'Module Name,Sourcing Strategy,Status,Notes\n';

        selectedModules.forEach(module => {
            const sourcing = modules[module.id]?.sourcing || 'Not specified';
            const hasData = moduleData[module.id] && Object.keys(moduleData[module.id]).length > 0;
            const status = hasData ? 'Configured' : 'Pending Configuration';
            const notes = module.required ? 'Required module' : 'Optional module';

            csvContent += `"${module.name}","${sourcing}","${status}","${notes}"\n`;
        });

        const dataBlob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${projectInfo.name.replace(/\s+/g, '_')}_ROM_Summary_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();

        URL.revokeObjectURL(url);
    };

    const generateCostEstimate = () => {
        let totalCost = 0;
        const costBreakdown = {};

        // Robotic Systems Cost
        if (moduleData.robotic_systems?.robots) {
            const robotCost = calculateRoboticsHardwareCost(moduleData.robotic_systems.robots);
            totalCost += robotCost;
            costBreakdown.robotic_systems = robotCost;
        }

        // Conveyance Systems Cost
        if (moduleData.conveyance?.segments) {
            const conveyanceCost = calculateConveyanceHardwareCost(moduleData.conveyance.segments);
            totalCost += conveyanceCost;
            costBreakdown.conveyance = conveyanceCost;
        }

        // Storage Infrastructure Cost
        if (moduleData.storage?.zones) {
            const storageCost = moduleData.storage.zones.reduce((sum, zone) => {
                const costPerPos = zone.type === 'Selective Racking' ? 60 : zone.type === 'Push Back' ? 120 : 40;
                return sum + (zone.positions * costPerPos);
            }, 0);
            totalCost += storageCost;
            costBreakdown.storage = storageCost;
        }

        // Controls & Electrical Cost
        if (moduleData.controls?.panels) {
            const controlsCost = moduleData.controls.panels.reduce((sum, panel) =>
                sum + (panel.quantity * panel.unitCost), 0);
            totalCost += controlsCost;
            costBreakdown.controls = controlsCost;
        }

        // Software Systems Cost
        if (moduleData.software?.applications) {
            const softwareCost = moduleData.software.applications.reduce((sum, application) =>
                sum + application.annualCost, 0);
            totalCost += softwareCost;
            costBreakdown.software = softwareCost;
        }

        // Implementation Services Cost
        if (moduleData.implementation?.services) {
            const implementationCost = moduleData.implementation.services.reduce((sum, service) =>
                sum + (service.hours * service.hourlyRate), 0);
            totalCost += implementationCost;
            costBreakdown.implementation = implementationCost;
        }

        return { total: totalCost, breakdown: costBreakdown };
    };

    const summary = generateProjectSummary();
    const costEstimate = generateCostEstimate();

    return (
        <div className="card">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-h2">Project Export & Summary</h2>
                <div className="flex gap-md">
                    <button
                        onClick={exportToJSON}
                        className="flex items-center gap-xs"
                        style={{
                            background: 'var(--color-primary)',
                            color: 'white',
                            border: 'none',
                            padding: 'var(--space-sm) var(--space-md)',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer'
                        }}
                    >
                        <Download size={16} />
                        Export JSON
                    </button>
                    <button
                        onClick={exportToCSV}
                        className="flex items-center gap-xs"
                        style={{
                            background: 'var(--color-success)',
                            color: 'white',
                            border: 'none',
                            padding: 'var(--space-sm) var(--space-md)',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer'
                        }}
                    >
                        <FileText size={16} />
                        Export CSV
                    </button>
                </div>
            </div>

            <div className="grid gap-lg" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div>
                    <h3 className="text-h2" style={{ fontSize: '1.25rem', marginBottom: 'var(--space-md)' }}>Project Overview</h3>
                    <div className="card" style={{ background: 'var(--color-bg-body)' }}>
                        <div style={{ marginBottom: 'var(--space-md)' }}>
                            <strong>Project Name:</strong> {projectInfo.name}
                        </div>
                        <div style={{ marginBottom: 'var(--space-md)' }}>
                            <strong>Project Lead:</strong> {projectInfo.lead || 'Not assigned'}
                        </div>
                        <div style={{ marginBottom: 'var(--space-md)' }}>
                            <strong>Status:</strong> {projectInfo.status}
                        </div>
                        <div>
                            <strong>Total Modules:</strong> {summary.totalModules}
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-h2" style={{ fontSize: '1.25rem', marginBottom: 'var(--space-md)' }}>Sourcing Strategy</h3>
                    <div className="card" style={{ background: 'var(--color-bg-body)' }}>
                        <div style={{ marginBottom: 'var(--space-sm)' }}>
                            <strong>Buyout:</strong> {summary.sourcingBreakdown.buyout} modules
                        </div>
                        <div style={{ marginBottom: 'var(--space-sm)' }}>
                            <strong>In-House:</strong> {summary.sourcingBreakdown.inHouse} modules
                        </div>
                        <div>
                            <strong>Hybrid:</strong> {summary.sourcingBreakdown.hybrid} modules
                        </div>
                    </div>
                </div>
            </div>

            {costEstimate.total > 0 && (
                <div className="mt-lg">
                    <h3 className="text-h2" style={{ fontSize: '1.25rem', marginBottom: 'var(--space-md)' }}>Cost Estimate</h3>
                    <div className="card" style={{ background: 'var(--color-bg-body)' }}>
                        <div className="flex justify-between items-center mb-md">
                            <strong>Total Estimated Cost:</strong>
                            <span className="text-h2" style={{ fontSize: '1.5rem', color: 'var(--color-primary)' }}>
                                ${costEstimate.total.toLocaleString()}
                            </span>
                        </div>

                        {Object.entries(costEstimate.breakdown).map(([module, cost]) => (
                            <div key={module} className="flex justify-between items-center" style={{ marginBottom: 'var(--space-sm)' }}>
                                <span>{module.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}:</span>
                                <span>${cost.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}



            <div className="mt-lg grid gap-lg" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div>
                    <h3 className="text-h2" style={{ fontSize: '1.25rem', marginBottom: 'var(--space-md)' }}>Assumptions</h3>
                    <div className="card" style={{ background: 'var(--color-bg-body)' }}>
                        <div style={{ marginBottom: 'var(--space-sm)' }}><strong>Total:</strong> {assumptions.length}</div>
                        {assumptions.length === 0 ? (
                            <span className="text-small">No assumptions captured.</span>
                        ) : (
                            assumptions.slice(0, 3).map((assumption) => (
                                <div key={assumption.id} className="text-small" style={{ marginBottom: 'var(--space-xs)' }}>
                                    • {assumption.statement}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div>
                    <h3 className="text-h2" style={{ fontSize: '1.25rem', marginBottom: 'var(--space-md)' }}>Requirements</h3>
                    <div className="card" style={{ background: 'var(--color-bg-body)' }}>
                        <div style={{ marginBottom: 'var(--space-sm)' }}><strong>Total:</strong> {requirements.length}</div>
                        <div className="text-small" style={{ marginBottom: 'var(--space-sm)' }}>
                            <strong>Document:</strong> {requirementsDocument?.name || 'None uploaded'}
                        </div>
                        {requirements.length === 0 ? (
                            <span className="text-small">No requirements captured.</span>
                        ) : (
                            requirements.slice(0, 3).map((requirement) => (
                                <div key={requirement.id} className="text-small" style={{ marginBottom: 'var(--space-xs)' }}>
                                    • {requirement.text}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-lg">
                <h3 className="text-h2" style={{ fontSize: '1.25rem', marginBottom: 'var(--space-md)' }}>Selected Modules</h3>
                <div className="grid gap-md" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
                    {summary.selectedModules.map(module => (
                        <div key={module.id} className="card" style={{ background: 'var(--color-bg-body)' }}>
                            <h4 style={{ margin: '0 0 var(--space-sm) 0' }}>{module.name}</h4>
                            <div className="text-small" style={{ marginBottom: 'var(--space-xs)' }}>
                                <strong>Sourcing:</strong> {module.sourcing}
                            </div>
                            <div className="text-small">
                                <strong>Status:</strong> {Object.keys(module.data).length > 0 ? 'Configured' : 'Pending Configuration'}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}