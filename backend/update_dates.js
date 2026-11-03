const mongoose = require('mongoose');

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const currentMonth = MONTHS[new Date().getMonth()];
const currentYear = new Date().getFullYear();

async function updateDbDates() {
  try {
    await mongoose.connect('mongodb://localhost:27017/Academic_Green_KPI_Dashboard');
    const db = mongoose.connection.db;
    const collections = ['energy_data', 'carbon_data', 'water_data', 'waste_data'];
    
    for (const col of collections) {
      const res = await db.collection(col).updateMany(
        {},
        { $set: { year: currentYear, month: currentMonth } }
      );
      console.log('Updated ' + col + ':', res.modifiedCount + ' documents to ' + currentMonth + ' ' + currentYear);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

updateDbDates();
