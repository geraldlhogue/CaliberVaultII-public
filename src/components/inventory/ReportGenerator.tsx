import React, { useState } from 'react';
import { InventoryItem, ItemCategory, FirearmSubcategory } from '../../types/inventory';
import { generateCSV, downloadCSV, emailReport } from '../../utils/exportUtils';
import { generatePDFContent, printPDF } from '../../utils/pdfExport';

interface ReportGeneratorProps {
  inventory: InventoryItem[];
  onClose: () => void;
}

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({ inventory, onClose }) => {
  const [filterCategory, setFilterCategory] = useState<ItemCategory | ''>('');
  const [filterCaliber, setFilterCaliber] = useState('');
  const [filterType, setFilterType] = useState<FirearmSubcategory | ''>('');
  const [filterLocation, setFilterLocation] = useState('');

  const filteredItems = inventory.filter(item => {
    const matchesCategory = !filterCategory || item.category === filterCategory;
    const matchesCaliber = !filterCaliber || (item.caliber && item.caliber.toLowerCase().includes(filterCaliber.toLowerCase()));
    const matchesType = !filterType || item.firearmSubcategory === filterType;
    const matchesLocation = !filterLocation || item.storageLocation.toLowerCase().includes(filterLocation.toLowerCase());
    return matchesCategory && matchesCaliber && matchesType && matchesLocation;
  });

  const totalCost = filteredItems.reduce((sum, item) => sum + (item.purchasePrice || 0), 0);
  const totalValue = filteredItems.reduce((sum, item) => {
    const latest = item.appraisals?.[item.appraisals.length - 1];
    return sum + (latest?.value || item.purchasePrice || 0);
  }, 0);

  const uniqueCalibers = Array.from(new Set(inventory.filter(i => i.caliber).map(i => i.caliber))).sort();
  const uniqueLocations = Array.from(new Set(inventory.map(i => i.storageLocation))).sort();

  const handleExportCSV = () => {
    const csv = generateCSV(filteredItems);
    downloadCSV(csv, `inventory-report-${Date.now()}.csv`);
  };

  const handleExportPDF = () => {
    const filters = { category: filterCategory, caliber: filterCaliber, type: filterType, location: filterLocation };
    const pdfContent = generatePDFContent(filteredItems, filters);
    printPDF(pdfContent);
  };

  const handleEmail = () => {
    const subject = 'Arsenal Command Inventory Report';
    const body = `Inventory Report\n\nTotal Items: ${filteredItems.length}\nTotal Cost: $${totalCost.toLocaleString()}\nCurrent Value: $${totalValue.toLocaleString()}\n\nGenerated: ${new Date().toLocaleString()}`;
    emailReport(subject, body);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-700 flex justify-between items-center sticky top-0 bg-slate-800 z-10">
          <h2 className="text-2xl font-bold text-white">Generate Report</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">&times;</button>
        </div>

        <div className="p-6 space-y-6">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 text-sm mb-2">Category</label>
              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value as ItemCategory | '')} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white">
                <option value="">All Categories</option>
                <option value="firearms">Firearms</option>
                <option value="optics">Optics</option>
                <option value="magazines">Magazines</option>
                <option value="ammunition">Ammunition</option>
                <option value="reloading">Reloading</option>
                <option value="accessories">Accessories</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 text-sm mb-2">Caliber</label>
              <select value={filterCaliber} onChange={(e) => setFilterCaliber(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white">
                <option value="">All Calibers</option>
                {uniqueCalibers.map(cal => <option key={cal} value={cal}>{cal}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 text-sm mb-2">Firearm Type</label>
              <select value={filterType} onChange={(e) => setFilterType(e.target.value as FirearmSubcategory | '')} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white">
                <option value="">All Types</option>
                <option value="centerfire-rifle">Centerfire Rifle</option>
                <option value="rimfire-rifle">Rimfire Rifle</option>
                <option value="centerfire-pistol">Centerfire Pistol</option>
                <option value="rimfire-pistol">Rimfire Pistol</option>
                <option value="revolver">Revolver</option>
                <option value="shotgun">Shotgun</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 text-sm mb-2">Storage Location</label>
              <select value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white">
                <option value="">All Locations</option>
                {uniqueLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
              </select>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="bg-slate-700 rounded-lg p-6">
            <h3 className="text-white font-semibold mb-4">Report Summary</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-yellow-600">{filteredItems.length}</div>
                <div className="text-slate-400 text-sm">Items</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-yellow-600">${totalCost.toLocaleString()}</div>
                <div className="text-slate-400 text-sm">Total Cost</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-yellow-600">${totalValue.toLocaleString()}</div>
                <div className="text-slate-400 text-sm">Current Value</div>
              </div>
            </div>
          </div>

          {/* Export Buttons */}
          <div className="flex flex-wrap gap-3">
            <button onClick={handleExportCSV} className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition flex items-center gap-2">
              <span>📊</span> Export CSV
            </button>
            <button onClick={handleExportPDF} className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg transition flex items-center gap-2">
              <span>📄</span> Print/PDF
            </button>
            <button onClick={handleEmail} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition flex items-center gap-2">
              <span>📧</span> Email Report
            </button>
          </div>

          {/* Preview */}
          <div>
            <h3 className="text-white font-semibold mb-3">Preview ({filteredItems.length} items)</h3>
            <div className="bg-slate-700 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
              <table className="w-full">
                <thead className="bg-slate-900 sticky top-0">
                  <tr>
                    <th className="text-left text-slate-300 px-4 py-2 text-sm">Name</th>
                    <th className="text-left text-slate-300 px-4 py-2 text-sm">Category</th>
                    <th className="text-left text-slate-300 px-4 py-2 text-sm">Caliber</th>
                    <th className="text-right text-slate-300 px-4 py-2 text-sm">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map(item => {
                    const currentValue = item.appraisals.length > 0 ? item.appraisals[item.appraisals.length - 1].value : item.purchasePrice;
                    return (
                      <tr key={item.id} className="border-t border-slate-600">
                        <td className="text-white px-4 py-2 text-sm">{item.name}</td>
                        <td className="text-slate-400 px-4 py-2 text-sm">{item.category}</td>
                        <td className="text-slate-400 px-4 py-2 text-sm">{item.caliber || '-'}</td>
                        <td className="text-yellow-600 px-4 py-2 text-sm text-right">${currentValue.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
