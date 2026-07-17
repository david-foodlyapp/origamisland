const fs = require('fs');
const path = './src/App.tsx';

let content = fs.readFileSync(path, 'utf8');

// Find the line index of "function LocationIcon()"
const lines = content.split('\n');
const startIndex = lines.findIndex(line => line.startsWith('function LocationIcon()'));
const endIndex = lines.findIndex(line => line.startsWith('export default App;'));

if (startIndex !== -1 && endIndex !== -1) {
  lines.splice(startIndex - 1, endIndex - startIndex);
  
  // Now add import statement at the top after other imports
  const importStatement = `import {
  LocationIcon, HomeIcon, CalendarIcon, BuildingIcon, CurrencyIcon, SearchIcon, FilterAdjustIcon,
  FacebookIcon, InstagramIcon, LinkedInIcon, CloseIcon, ChatIcon, CheckIcon, MoonIcon, SunIcon,
  ChevronIcon, ArrowIcon, LifestyleIcon, WellnessIcon, ParkingIcon, RestaurantsIcon, RetailIcon,
  WaterfrontIcon, LoungeIcon, FamilyIcon, LongevityIcon, RecoveryIcon, HealthyLivingIcon,
  FitnessIcon, MeditationIcon, SpaIcon, EnergyBalanceIcon, CityGrowthIcon, IslandInvestmentIcon,
  RoiTrendIcon, TourismFlowIcon, RentalModelIcon, GlobeOutlineIcon, BlueprintOutlineIcon,
  AudienceOutlineIcon, PriceTagIcon, InstallmentIcon, ResidenceIcon, HotelSuiteIcon, PenthouseIcon
} from "./components/Icons";`;
  
  // Insert import after the first few imports
  lines.splice(3, 0, importStatement);
  
  fs.writeFileSync(path, lines.join('\n'));
  console.log("Icons removed and import added");
} else {
  console.log("Could not find boundaries");
}
