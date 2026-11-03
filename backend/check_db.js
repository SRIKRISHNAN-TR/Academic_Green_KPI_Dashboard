const mongoose = require('mongoose');

async function checkData() {
  try {
    await mongoose.connect('mongodb://localhost:27017/Academic_Green_KPI_Dashboard');
    const db = mongoose.connection.db;
    const collections = ['energy_data', 'carbon_data', 'water_data', 'waste_data'];
    
    let report = '';
    
    for (const col of collections) {
      const count = await db.collection(col).countDocuments();
      const sample = await db.collection(col).findOne();
      
      report += `\n=== ${col} (${count} docs) ===\n`;
      if (sample) {
        report += `Keys: ${Object.keys(sample).join(', ')}\n`;
        report += `Sample Data:\n${JSON.stringify(sample, null, 2)}\n`;
      } else {
        report += 'No data found.\n';
      }
    }
    
    require('fs').writeFileSync('db_report.txt', report);
    console.log('Report saved to db_report.txt');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkData();
