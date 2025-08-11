// --- script.js (Full Updated Code with new bid increments, Skip button, Overseas & Squad Limits) ---

// Hey! This is where all the game magic happens! ✨

// --- Global Game State and Data ---
// Ye apni teams hain, bhai. Inka budget, squad, sab yahi set karte hain.
const TEAMS = [
    { id: 'RCB', name: 'Royal Challengers Bangalore', budget: 120, purse: 120, squad: [], retainedPlayers: [] },
    { id: 'MI', name: 'Mumbai Indians', budget: 120, purse: 120, squad: [], retainedPlayers: [] },
    { id: 'CSK', name: 'Chennai Super Kings', budget: 120, purse: 120, squad: [], retainedPlayers: [] },
    { id: 'DC', name: 'Delhi Capitals', budget: 120, purse: 120, squad: [], retainedPlayers: [] },
    { id: 'KKR', name: 'Kolkata Knight Riders', budget: 120, purse: 120, squad: [], retainedPlayers: [] },
    { id: 'SRH', name: 'Sunrisers Hyderabad', budget: 120, purse: 120, squad: [], retainedPlayers: [] },
    { id: 'RR', name: 'Rajasthan Royals', budget: 120, purse: 120, squad: [], retainedPlayers: [] },
    { id: 'GT', name: 'Gujarat Titans', budget: 120, purse: 120, squad: [], retainedPlayers: [] },
    { id: 'LSG', name: 'Lucknow Super Giants', budget: 120, purse: 120, squad: [], retainedPlayers: [] },
    { id: 'PBKS', name: 'Punjab Kings', budget: 120, purse: 120, squad: [], retainedPlayers: [] },
];

// Saare players ka data yahan store hoga, unke ID ke saath easy search ke liye.
let allPlayersData = {};

// Jo players auction mein aayenge, unki list.
let availablePlayers = [];

// Kuch important game variables
let userSelectedTeamId = null;
let currentAuctionPlayer = null;
let currentHighestBid = 0;
let highestBidderTeamId = null;
let previousHighestBid = 0; // To store bid before current highest
let previousHighestBidderTeamId = null; // To store team before current highest
let auctionTimer = null;
const AUCTION_TIME_PER_PLAYER = 20; // Seconds mein
let isAuctionPaused = false; // Auction pause karne ke liye jab details popup khula ho.
let aiBidTimeoutId = null; // AI bidding timeout ko store karne ke liye
let teamsCurrentlyBidding = new Set(); // Ye track karega kaun si teams abhi active bid kar sakti hain
let auctionLog = []; // Local Storage ke liye auction log save karenge.

// --- DOM Elements ---
// HTML ke elements ko pakadne ke liye, taaki unhe JavaScript se control kar saken.
const teamButtonsContainer = document.getElementById('team-buttons');
const userTeamDetailsSection = document.getElementById('user-team-details');
const selectedTeamNameSpan = document.getElementById('selected-team-name');
const retentionListDiv = document.getElementById('retention-list');
const confirmRetentionBtn = document.getElementById('confirm-retention-btn');
const auctionBoard = document.getElementById('auction-board');
const playerPhoto = document.getElementById('player-photo');
const playerName = document.getElementById('player-name');
const basePriceSpan = document.getElementById('base-price');
const playerRoleSpan = document.getElementById('player-role');
const playerNationalitySpan = document.getElementById('player-nationality');
const currentHighestBidSpan = document.getElementById('current-highest-bid');
const highestBidderTeamSpan = document.getElementById('highest-bidder-team');
const auctionTimerSpan = document.getElementById('auction-timer');
const placeBidBtn = document.getElementById('place-bid-btn');
const skipBidBtn = document.getElementById('skip-bid-btn'); // Renamed from passBidBtn
const auctionLogList = document.getElementById('auction-log');
const auctionDetailsBtn = document.getElementById('auction-details-btn');
const detailsPopup = document.getElementById('details-popup');
const closeDetailsBtn = detailsPopup.querySelector('.close-btn');
const playerListBtn = document.getElementById('player-list-btn');
const purseRemainingBtn = document.getElementById('purse-remaining-btn');
const currentSquadBtn = document.getElementById('current-squad-btn');
const detailsView = document.getElementById('details-view');
const clearSavedGameBtn = document.getElementById('clear-saved-game-btn'); // Naya button

// --- Helper Functions (NEWLY ADDED / VERIFIED) ---
function isOverseasPlayer(player) {
    return player.nationality !== 'India';
}

function countOverseasPlayers(team) {
    const fullSquad = [...team.retainedPlayers, ...team.squad];
    return fullSquad.filter(p => isOverseasPlayer(p)).length;
}

function getTotalSquadSize(team) {
    return team.retainedPlayers.length + team.squad.length;
}


// --- Initial Data Setup ---
// Game shuru hone par saara data set karte hain.
function initializeGameData() {
    // Apne saare players ki list yahan hai, bhai. Har player ka unique ID hona chahiye!
    const allKnownPlayers = [
        // RCB
        { id: 'rcb_vk', name: 'Virat Kohli', role: 'BATSMAN', nationality: 'India', basePrice: 2.0, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/2.png' },
        { id: 'rcb_fdp', name: 'Faf du Plessis', role: 'BATSMAN', nationality: 'South Africa', basePrice: 2.0, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/94.png' },
        { id: 'rcb_max', name: 'Glenn Maxwell', role: 'ALL-ROUNDER', nationality: 'Australia', basePrice: 2.0, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/28.png' },
        { id: 'rcb_jack', name: 'Will Jacks', role: 'ALL-ROUNDER', nationality: 'England', basePrice: 2.0, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/1941.png' },
        { id: 'rcb_siraj', name: 'Mohammed Siraj', role: 'PACER', nationality: 'India', basePrice: 1.5, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/63.png' },
        { id: 'rcb_akshdeep', name: 'Akash Deep', role: 'PACER', nationality: 'India', basePrice: 0.5, photo: 'https://www.thehealthsite.com/wp-content/uploads/2024/06/1007.png' },
        { id: 'rcb_dayal', name: 'Yash Dayal', role: 'PACER', nationality: 'India', basePrice: 0.5, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/978.png' },
        { id: 'rcb_sdu', name: 'Suyash Prabhudessai', role: 'BATSMAN', nationality: 'India', basePrice: 0.75, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/598.png' },
        { id: 'rcb_rapa', name: 'Rajat Patidar', role: 'BATSMAN', nationality: 'India', basePrice: 0.75, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/597.png' },
        { id: 'rcb_loma', name: 'Mahipal Lomror', role: 'ALL-ROUNDER', nationality: 'India', basePrice: 0.75, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/184.png' },
        { id: 'rcb_anujrawat', name: 'Anuj Rawat', role: 'WICKET-KEEPER', nationality: 'India', basePrice: 0.75, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/534.png' },
        { id: 'rcb_green', name: 'Cameron Green', role: 'ALL-ROUNDER', nationality: 'Australia', basePrice: 2.0, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/550.png' },
        { id: 'rcb_lokie', name: 'Lockie Ferguson', role: 'PACER', nationality: 'New Zealand', basePrice: 2.0, photo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9J0QF4YB1n8x8yfrh4rh9mwHfrLKPXUI9pw&s' },
        { id: 'rcb_karn', name: 'Karn Sharma', role: 'SPINNER', nationality: 'India', basePrice: 1.0, photo: 'https://ipltable.in/wp-content/uploads/2024/03/image-51-700x700.jpeg' },
        { id: 'rcb_himanshu', name: 'Himanshu Sharma', role: 'SPINNER', nationality: 'India', basePrice: 0.3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/1568.png' },
        { id: 'rcb_rajan', name: 'Rajan Kumar', role: 'PACER', nationality: 'India', basePrice: 0.3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/1503.png' },
        { id: 'rcb_dagar', name: 'Mayank Dagar', role: 'ALL-ROUNDER', nationality: 'India', basePrice: 0.3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/1547.png' },
        { id: 'rcb_vyshak', name: 'Vijaykumar Vyshak', role: 'PACER', nationality: 'India', basePrice: 0.3, photo: 'https://blr1.digitaloceanspaces.com/newskarnataka.com/wp-content/uploads/2024/08/130820241293.webp' },
        { id: 'rcb_alzarri', name: 'Alzarri Joseph', role: 'PACER', nationality: 'West Indies', basePrice: 1.0, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/229.png' },
        { id: 'rcb_tomcurr', name: 'Tom Curran', role: 'PACER', nationality: 'England', basePrice: 1.0, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/309.png' },
        { id: 'rcb_topley', name: 'Reece Topley', role: 'PACER', nationality: 'England', basePrice: 1.0, photo: 'https://cricclubs.com/documentsRep/profilePics/ffc537ef-2699-4aee-b383-589a847434be.jpeg' },











        // MI
        { id: 'mi_rohit', name: 'Rohit Sharma', role: 'BATSMAN', nationality: 'India', basePrice: 2.0, photo: 'https://www.watsup.in/wp-content/uploads/2019/04/6.png' },
        { id: 'mi_sky', name: 'Suryakumar Yadav', role: 'BATSMAN', nationality: 'India', basePrice: 2.0, photo: 'https://assets.iplt20.com/ipl/IPLHeadshot2022/108.png' },
        { id: 'mi_bum', name: 'Jasprit Bumrah', role: 'PACER', nationality: 'India', basePrice: 2.0, photo: 'https://static.toiimg.com/photo/119128041.cms' },
        { id: 'mi_ishan', name: 'Ishan Kishan', role: 'WICKET-KEEPER', nationality: 'India', basePrice: 1.5, photo: 'https://kingsofcricket.in/wp-content/uploads/2024/07/ishan-kishan-200-vs-bangladesh-e1719926885599.webp' },
        { id: 'mi_tilak', name: 'Tilak Varma', role: 'ALL-ROUNDER', nationality: 'India', basePrice: 2.0, photo: 'https://en.wikiflux.org/wiki/images/1/18/Tilak_Varma.png' },
        { id: 'mi_wadhera', name: 'Nehal Wadhera', role: 'BATSMAN', nationality: 'India', basePrice: 1.0, photo: 'https://iplcricbet.com/wp-content/uploads/2024/03/Nehal-Wadhera.jpg' },
        { id: 'mi_tim', name: 'Tim David', role: 'ALL-ROUNDER', nationality: 'Australia', basePrice: 2.0, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/636.png' },
        { id: 'mi_dew', name: 'Dewald Brevis', role: 'BATSMAN', nationality: 'South Africa', basePrice: 0.75, photo: 'https://ipltable.in/wp-content/uploads/2024/02/image-2.png' },
        { id: 'mi_chawla', name: 'Piyush Chawla', role: 'SPINNER', nationality: 'India', basePrice: 0.5, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/149.png' },
        { id: 'mi_hardik', name: 'Hardik Pandya', role: 'ALL-ROUNDER', nationality: 'India', basePrice: 2.0, photo: 'https://static.toiimg.com/photo/119127816.cms' },
        { id: 'mi_romario', name: 'Romario Shepherd', role: 'ALL-ROUNDER', nationality: 'West Indies', basePrice: 1.5, photo: 'https://iplcricbet.com/wp-content/uploads/2024/03/Romario-Shepherd.jpg' },
        { id: 'mi_namanDhir', name: 'Naman Dhir', role: 'BATSMAN', nationality: 'India', basePrice: 0.50, photo: 'https://www.mumbaiindians.com/static-assets/images/players/large/action-shots/100353.png?v=4.16&w=400' },
        { id: 'mi_nabi', name: 'Mohammad Nabi', role: 'BATSMAN', nationality: 'Afghanistan', basePrice: 1.5, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/217.png' },
        { id: 'mi_coetzee', name: 'Gerald Coetzee', role: 'PACER', nationality: 'South Africa', basePrice: 1.0, photo: 'https://ujjwalpradesh.com/wp-content/uploads/2024/03/Gerald-Coetzee.png' },
        { id: 'mi_kartikeya', name: 'Kumar Kartikeya', role: 'SPINNER', nationality: 'India', basePrice: 0.3, photo: 'https://ipltable.in/wp-content/uploads/2024/02/image-21-700x700.jpeg' },
        { id: 'mi_madhwal', name: 'Akash Madhwal', role: 'PACER', nationality: 'India', basePrice: 0.3, photo: 'https://ipltable.in/wp-content/uploads/2024/02/image-7.png' },
        { id: 'mi_tendulkar', name: 'Arjun Tendulkar', role: 'PACER', nationality: 'India', basePrice: 0.3, photo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQs8snRy_BhR8E4qLwY2JnAAg6POuROYsL-bw&s' },
        { id: 'mi_thushara', name: 'Nuwan Thushara', role: 'PACER', nationality: 'Sri Lanka', basePrice: 0.75, photo: 'https://staticg.sportskeeda.com/editor/2024/04/49d13-17131900660071-1920.jpg?w=640' },
        { id: 'mi_maphaka', name: 'Kwena Maphaka', role: 'PACER', nationality: 'South Africa', basePrice: 0.3, photo: 'https://www.wisden.com/static-assets/images/players/90908.png?v=23.77' },
        { id: 'mi_kamboj', name: 'Anshul Kamboj', role: 'PACER', nationality: 'India', basePrice: 0.3, photo: 'https://www.wisden.com/static-assets/images/players/71151.png?v=23.76' },
        { id: 'mi_lukewood', name: 'Luke Wood', role: 'PACER', nationality: 'England', basePrice: 0.75, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/3116.png' },
        { id: 'mi_behrendorff', name: 'Jason Behrendorff', role: 'PACER', nationality: 'Australia', basePrice: 1.75, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2023/4.png' },
        { id: 'mi_madushanka', name: 'Dilshan Madushanka', role: 'PACER', nationality: 'Sri Lanka', basePrice: 0.30, photo: 'https://bmkltsly13vb.compat.objectstorage.ap-mumbai-1.oraclecloud.com/cdn.ft.lk/assets/uploads/image_14059f5898.jpg' },











        //* CSK

        { id: 'csk_msd', name: 'MS Dhoni', role: 'WICKET-KEEPER', nationality: 'India', basePrice: 2.0, photo: 'https://i.pinimg.com/736x/36/d7/f3/36d7f3e4ea55ed1e87f81fd930827888.jpg' },
        { id: 'csk_jadeja', name: 'Ravindra Jadeja', role: 'ALL-ROUNDER', nationality: 'India', basePrice: 2.0, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/46.png' },
        { id: 'csk_rtj', name: 'Ruturaj Gaikwad', role: 'BATSMAN', nationality: 'India', basePrice: 1.5, photo: 'https://static.toiimg.com/photo/119128260.cms' },
        { id: 'csk_conway', name: 'Devon Conway', role: 'WICKET-KEEPER', nationality: 'New Zealand', basePrice: 1.0, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2023/601.png' },
        { id: 'csk_deepak', name: 'Deepak Chahar', role: 'PACER', nationality: 'India', basePrice: 2.0, photo: 'https://www.iplbetonline.in/wp-content/uploads/2023/04/91.png' },
        { id: 'csk_moeen', name: 'Moeen Ali', role: 'ALL-ROUNDER', nationality: 'England', basePrice: 1.5, photo: 'https://assets.iplt20.com/ipl/IPLHeadshot2022/1735.png' },
        { id: 'csk_dube', name: 'Shivam Dube', role: 'ALL-ROUNDER', nationality: 'India', basePrice: 2.0, photo: 'https://www.iplbetonline.in/wp-content/uploads/2023/04/211.png' },
        { id: 'csk_pathirana', name: 'Matheesha Pathirana', role: 'PACER', nationality: 'Sri Lanka', basePrice: 1.5, photo: 'https://www.iplbetonline.in/wp-content/uploads/2023/04/1014-780x780.png' },
        { id: 'csk_santner', name: 'Mitchell Santner', role: 'ALL-ROUNDER', nationality: 'New Zealand', basePrice: 1.75, photo: 'https://iplcricbet.com/wp-content/uploads/2024/02/Mitchell-Santner.jpg' },
        { id: 'csk_daryl', name: 'Daryl Mitchell', role: 'ALL-ROUNDER', nationality: 'New Zealand', basePrice: 2.0, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/83.png' },
        { id: 'csk_tushar', name: 'Tushar Deshpande', role: 'PACER', nationality: 'India', basePrice: 0.5, photo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcShsdqc3EeBZrG7VzuFFMtxArImTVyW9N2VTQ&s' },
        { id: 'csk_rahane', name: 'Ajinkya Rahane', role: 'BATSMAN', nationality: 'India', basePrice: 1.5, photo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQUUVRhX-mhrkWZ9HK3ooUcXLbwL9acDZGlhg&s' },
        { id: 'csk_rizvi', name: 'Sameer Rizvi', role: 'BATSMAN', nationality: 'India', basePrice: 0.3, photo: 'https://iplcricbet.com/wp-content/uploads/2024/06/Sameer-Rizvi.jpg' },
        { id: 'csk_shaikRasheed', name: 'Shaik Rasheed', role: 'BATSMAN', nationality: 'India', basePrice: 0.3, photo: 'https://ipltable.in/wp-content/uploads/2024/02/image-34-700x700.jpeg' },
        { id: 'csk_rachin', name: 'Rachin Ravindra', role: 'ALL-ROUNDER', nationality: 'New Zealand', basePrice: 1.5, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2025/724.png' },
        { id: 'csk_gleeson', name: 'Richard Gleeson', role: 'PACER', nationality: 'England', basePrice: 0.5, photo: 'https://crickettimes.com/wp-content/uploads/2024/04/Richard-Gleeson-2.webp' },
        { id: 'csk_mukeshCh', name: 'Mukesh Choudhary', role: 'PACER', nationality: 'India', basePrice: 0.3, photo: 'https://d1k8sn41pix00a.cloudfront.net/media/players/photos/Mukesh_Choudhary.png' },
        { id: 'csk_mustafizurR', name: 'Mustafizur Rahman', role: 'PACER', nationality: 'Bangladesh', basePrice: 2.0, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/258.png' },
        { id: 'csk_simarjeetS', name: 'Simarjeet Singh', role: 'PACER', nationality: 'India', basePrice: 0.30, photo: 'https://d1k8sn41pix00a.cloudfront.net/media/players/photos/Simarjeet_Singh.jpeg' },
        { id: 'csk_shardul', name: 'Shardul Thakur', role: 'PACER', nationality: 'India', basePrice: 2.0, photo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQlwZk1Pb3iFhm0slt2JxqKKGzdjr-eAy2Mew&s' },
        { id: 'csk_theekshana', name: 'Maheesh Theekshana', role: 'SPINNER', nationality: 'Sri Lanka', basePrice: 1.0, photo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBDLKiCvycdmsRwXvsnGfVKL9Nfai5GgDfJg&s' },


        // CSK End Squad 












        //* DC

        { id: 'dc_pant', name: 'Rishabh Pant', role: 'WICKET-KEEPER', nationality: 'India', basePrice: 2.0, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/18.png' },
        { id: 'dc_warner', name: 'David Warner', role: 'BATSMAN', nationality: 'Australia', basePrice: 2.0, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/214.png' },
        { id: 'dc_axar', name: 'Axar Patel', role: 'ALL-ROUNDER', nationality: 'India', basePrice: 2.0, photo: 'https://ipltable.in/wp-content/uploads/2024/02/image-62-700x700.jpeg' },
        { id: 'dc_shaw', name: 'Prithvi Shaw', role: 'BATSMAN', nationality: 'India', basePrice: 1.0, photo: 'https://preview.redd.it/ipl-2024-delhi-capitals-retain-prithvi-shaw-v0-8g1pxxkz5j2c1.png?auto=webp&s=2e34f43423e9032f4f3de96b17e511bb2b37e6f4' },
        { id: 'dc_anrich', name: 'Anrich Nortje', role: 'PACER', nationality: 'South Africa', basePrice: 1.5, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/142.png' },
        { id: 'dc_marsh', name: 'Mitchell Marsh', role: 'ALL-ROUNDER', nationality: 'Australia', basePrice: 2.0, photo: 'https://kheltoday.com/wp-content/uploads/2023/04/40.png' },
        { id: 'dc_kuldeep', name: 'Kuldeep Yadav', role: 'SPINNER', nationality: 'India', basePrice: 2.0, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/14.png' },
        { id: 'dc_mukeshKu', name: 'Mukesh Kumar', role: 'PACER', nationality: 'India', basePrice: 1.5, photo: 'https://ipltable.in/wp-content/uploads/2024/02/image-69-700x700.jpeg' },
        { id: 'dc_abhiPorel', name: 'Abishek Porel', role: 'WICKET-KEEPER', nationality: 'India', basePrice: 1.0, photo: 'https://ipltable.in/wp-content/uploads/2024/02/image-60-700x700.jpeg' },
        { id: 'dc_chikara', name: 'Swastik Chikara', role: 'BATSMAN', nationality: 'India', basePrice: 0.3, photo: 'https://d1k8sn41pix00a.cloudfront.net/media/players/photos/Swastik_Chikara.jpg' },
        { id: 'dc_yashDhul', name: 'Yash Dhull', role: 'BATSMAN', nationality: 'India', basePrice: 0.3, photo: 'https://ipltable.in/wp-content/uploads/2024/02/image-68.jpeg' },
        { id: 'dc_jakeFraser', name: 'Jake Fraser-McGurk', role: 'BATSMAN', nationality: 'Australia', basePrice: 1.5, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/3115.png' },
        { id: 'dc_hope', name: 'Shai Hope', role: 'WICKET-KEEPER', nationality: 'West Indies', basePrice: 1.0, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/268.png' },
        { id: 'dc_kushagra', name: 'Kumar Kushagra', role: 'WICKET-KEEPER', nationality: 'India', basePrice: 0.3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/3101.png' },
        { id: 'dc_stubbs', name: 'Tristan Stubbs', role: 'WICKET-KEEPER', nationality: 'South Africa', basePrice: 1.5, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2025/1017.png' },
        { id: 'dc_brook', name: 'Harry Brook', role: 'BATSMAN', nationality: 'England', basePrice: 1.0, photo: 'https://crickettimes.com/wp-content/uploads/2024/03/Harry-Brook-out-of-IPL-2024.webp' },
        { id: 'dc_lalitYa', name: 'Lalit Yadav', role: 'ALL-ROUNDER', nationality: 'India', basePrice: 0.3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/538.png' },
        { id: 'dc_khaleel', name: 'Khaleel Ahmed', role: 'PACER', nationality: 'India', basePrice: 1.0, photo: 'https://ipltable.in/wp-content/uploads/2024/02/image-65-700x700.jpeg' },
        { id: 'dc_praveenDu', name: 'Praveen Dubey', role: 'SPINNER', nationality: 'India', basePrice: 0.3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/548.png' },
        { id: 'dc_ostwal', name: 'Vicky Ostwal', role: 'SPINNER', nationality: 'India', basePrice: 0.3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/786.png' },
        { id: 'dc_rasikhDar', name: 'Rasikh Salam Dar', role: 'PACER', nationality: 'India', basePrice: 0.3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/172.png' },
        { id: 'dc_jhyeRich', name: 'Jhye Richardson', role: 'PACER', nationality: 'Australia', basePrice: 0.3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/59.png' },
        { id: 'dc_ishantS', name: 'Ishant Sharma', role: 'PACER', nationality: 'India', basePrice: 0.75, photo: 'https://iplcricbet.com/wp-content/uploads/2024/07/Ishant-Sharma.jpg' },
        { id: 'dc_lizaadW', name: 'Lizaad Williams', role: 'PACER', nationality: 'South Africa', basePrice: 0.75, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/631.png' },


        // DC Squad End











        //* KKR

        { id: 'kkr_iyer', name: 'Shreyas Iyer', role: 'BATSMAN', nationality: 'India', basePrice: 2.0, photo: 'https://www.kkr.in/static-assets/images/players/63961.png?v=111.76' },
        { id: 'kkr_russell', name: 'Andre Russell', role: 'ALL-ROUNDER', nationality: 'West Indies', basePrice: 2.0, photo: 'https://static.toiimg.com/photo/119127559.cms' },
        { id: 'kkr_narine', name: 'Sunil Narine', role: 'ALL-ROUNDER', nationality: 'West Indies', basePrice: 2.0, photo: 'https://static.toiimg.com/photo/119128855.cms' },
        { id: 'kkr_rana', name: 'Nitish Rana', role: 'BATSMAN', nationality: 'India', basePrice: 1.5, photo: 'https://www.kkr.in/static-assets/images/players/63649.png?v=111.76' },
        { id: 'kkr_varun', name: 'Varun Chakravarthy', role: 'SPINNER', nationality: 'India', basePrice: 2.0, photo: 'https://iplcricbet.com/wp-content/uploads/2024/04/Varun-Chakravarthy.jpg' },
        { id: 'kkr_vc', name: 'Venkatesh Iyer', role: 'ALL-ROUNDER', nationality: 'India', basePrice: 2.0, photo: 'https://iplcricbet.com/wp-content/uploads/2024/04/PROFILE-PICK.jpg' },
        { id: 'kkr_rinku', name: 'Rinku Singh', role: 'BATSMAN', nationality: 'India', basePrice: 2.0, photo: 'https://iplwiki.com/wp-content/uploads/2001/11/Rinku-Singh.png' },
        { id: 'kkr_manishPan', name: 'Manish Pandey', role: 'BATSMAN', nationality: 'India', basePrice: 1.0, photo: 'https://i.redd.it/n8rvabgn08xc1.png' },
        { id: 'kkr_ksbharat', name: 'Srikar Bharat', role: 'WICKET-KEEPER', nationality: 'India', basePrice: 1.0, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/365.png' },
        { id: 'kkr_salt', name: 'Phil Salt', role: 'WICKET-KEEPER', nationality: 'England', basePrice: 2.0, photo: 'https://www.kkr.in/static-assets/images/players/65632.png?v=111.76' },
        { id: 'kkr_gurbaz', name: 'Rahmanullah Gurbaz', role: 'WICKET-KEEPER', nationality: 'Afghanistan', basePrice: 2.0, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/641.png' },
        { id: 'kkr_angkrishR', name: 'Angkrish Raghuvanshi', role: 'BATSMAN', nationality: 'India', basePrice: 1.0, photo: 'https://www.wisden.com/static-assets/images/players/88352.png?v=23.77' },
        { id: 'kkr_ramandeepS', name: 'Ramandeep Singh', role: 'BATSMAN', nationality: 'India', basePrice: 1.0, photo: 'https://iplwiki.com/wp-content/uploads/2024/05/Ramandeep-Singh-300x300.png' },
        { id: 'kkr_rutherford', name: 'Sherfane Rutherford', role: 'BATSMAN', nationality: 'West Indies', basePrice: 1.0, photo: 'https://www.kkr.in/static-assets/images/players/67285.png?v=111.76' },
        { id: 'kkr_anukulRoy', name: 'Anukul Roy', role: 'ALL-ROUNDER', nationality: 'India', basePrice: 0.5, photo: 'https://d1k8sn41pix00a.cloudfront.net/media/players/photos/anukul_roy.jpg' },
        { id: 'kkr_arora', name: 'Vaibhav Arora', role: 'PACER', nationality: 'India', basePrice: 0.5, photo: 'https://iplcricbet.com/wp-content/uploads/2024/04/Vaibhav-Arora.jpg' },
        { id: 'kkr_chamera', name: 'Dushmantha Chameera', role: 'PACER', nationality: 'Sri Lanka', basePrice: 0.5, photo: 'https://www.kkr.in/static-assets/images/players/58065.png?v=111.76' },
        { id: 'kkr_ghazanfar', name: 'Allah Mohammad Ghazanfar', role: 'SPINNER', nationality: 'Afghanistan', basePrice: 0.5, photo: 'https://www.kkr.in/static-assets/images/players/96648.png?v=111.76' },
        { id: 'kkr_harshitR', name: 'Harshit Rana', role: 'PACER', nationality: 'India', basePrice: 1.0, photo: 'https://preview.redd.it/kkr-just-announced-harshit-rana-as-their-new-captain-ipl-v0-nxyi780owhje1.png?width=640&crop=smart&auto=webp&s=2c7d3d88ea97217a388e40d34e7955cc96f5e5db' },
        { id: 'kkr_chetanS', name: 'Chetan Sakariya', role: 'PACER', nationality: 'India', basePrice: 0.3, photo: 'https://iplcricbet.com/wp-content/uploads/2024/04/Chetan-Sakariya.jpg' },
        { id: 'kkr_starc', name: 'Mitchell Starc', role: 'PACER', nationality: 'Australia', basePrice: 2.0, photo: 'https://www.kkr.in/static-assets/images/players/10053.png?v=111.76' },
        { id: 'kkr_sakibHus', name: 'Sakib Hussain', role: 'PACER', nationality: 'India', basePrice: 0.3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/3104.png' },
        { id: 'kkr_suyashS', name: 'Suyash Sharma', role: 'SPINNER', nationality: 'India', basePrice: 1.0, photo: 'https://i.redd.it/which-spinner-should-we-target-in-the-auction-v0-g9bjlbv1llyd1.png?width=1024&format=png&auto=webp&s=d0dba441adc8d3f33fa56a466f67fe58e95a0c94' },













        //* SRH

        { id: 'srh_klaasen', name: 'Heinrich Klaasen', role: 'WICKET-KEEPER', nationality: 'South Africa', basePrice: 2.0, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2025/202.png' },
        { id: 'srh_cummins', name: 'Pat Cummins', role: 'PACER', nationality: 'Australia', basePrice: 2.0, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2025/33.png' },
        { id: 'srh_head', name: 'Travis Head', role: 'BATSMAN', nationality: 'Australia', basePrice: 2.0, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2025/37.png' },
        { id: 'srh_markram', name: 'Aiden Markram', role: 'BATSMAN', nationality: 'South Africa', basePrice: 2.0, photo: 'https://cricclubs.com/documentsRep/profilePics/0587b3ae-eac4-4299-97bf-83396f2636cb.jpeg' },
        { id: 'srh_bhuvi', name: 'Bhuvneshwar Kumar', role: 'PACER', nationality: 'India', basePrice: 2.0, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/15.png' },
        { id: 'srh_abhishekS', name: 'Abhishek Sharma', role: 'ALL-ROUNDER', nationality: 'India', basePrice: 2.0, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2025/212.png' },
        { id: 'srh_tripathi', name: 'Rahul Tripathi', role: 'BATSMAN', nationality: 'India', basePrice: 1.0, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/188.png' },
        { id: 'srh_umran', name: 'Umran Malik', role: 'PACER', nationality: 'India', basePrice: 0.75, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/637.png' },
        { id: 'srh_abdul', name: 'Abdul Samad', role: 'ALL-ROUNDER', nationality: 'India', basePrice: 0.5, photo: 'https://i1.wp.com/crictoday.com/wp-content/uploads/2023/04/Abdul-Samad.jpg?ssl=1' },
        { id: 'srh_washington', name: 'Washington Sundar', role: 'ALL-ROUNDER', nationality: 'India', basePrice: 2.0, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/20.png' },
        { id: 'srh_nattu', name: 'T Natarajan', role: 'PACER', nationality: 'India', basePrice: 0.75, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/224.png' },
        { id: 'srh_philips', name: 'Glenn Phillips', role: 'ALL-ROUNDER', nationality: 'New Zealand', basePrice: 2.0, photo: 'https://preview.redd.it/we-will-never-really-know-if-playing-gp-would-have-helped-us-v0-ooexk5mpnt2d1.png?auto=webp&s=23638d8717fd8236e3a2e6c8cc580679d53571d0' },
        { id: 'srh_farooqi', name: 'Fazalhaq Farooqi', role: 'PACER', nationality: 'Afghanistan', basePrice: 0.5, photo: 'https://www.iplbetonline.in/wp-content/uploads/2023/04/20610-780x780.png' },
        { id: 'srh_mayank', name: 'Mayank Agarwal', role: 'BATSMAN', nationality: 'India', basePrice: 1.0, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/55.png' },
        { id: 'srh_mJansen', name: 'Marco Jansen', role: 'ALL-ROUNDER', nationality: 'South Africa', basePrice: 1.5, photo: 'https://ipltable.in/wp-content/uploads/2024/03/image-29.jpeg' },
        { id: 'srh_nkReddy', name: 'Nitish Kumar Reddy', role: 'ALL-ROUNDER', nationality: 'India', basePrice: 2.0, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/1944.png' },
        { id: 'srh_shahbaz', name: 'Shahbaz Ahmed', role: 'ALL-ROUNDER', nationality: 'India', basePrice: 0.75, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/523.png' },
        { id: 'srh_mMarkande', name: 'Mayank Markande', role: 'SPINNER', nationality: 'India', basePrice: 0.5, photo: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiZKvh5lt3a-hj2sEdz-lHqf50bhODF7BZbuAwpJKKSFgWXTkexXYPnHZ6TFKi4LRWiKDJmQKm_AexNLMpShHsC7Q4nJGm8WWqctD8K-DVgh1oMlc-9cEXtKZUpBupjnCAEVbyW2A62z60X7fxBvnqMDixFAKM0I6MtRAKtxbUj986-WufQqX-95gtp/s1024/Mayank-Markande.png' },
        { id: 'srh_anmolpret', name: 'Anmolpreet Singh', role: 'BATSMAN', nationality: 'India', basePrice: 0.3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/159.png' },
        { id: 'srh_unadkat', name: 'Jaydev Unadkat', role: 'PACER', nationality: 'India', basePrice: 1.0, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2025/180.png' },














        //* RR

        { id: 'rr_sanju', name: 'Sanju Samson', role: 'WICKET-KEEPER', nationality: 'India', basePrice: 2.0, photo: 'https://i.pinimg.com/736x/ad/44/8c/ad448c61409fb11e7f8d85be9f21bf78.jpg' },
        { id: 'rr_buttler', name: 'Jos Buttler', role: 'WICKET-KEEPER', nationality: 'England', basePrice: 2.0, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/182.png' },
        { id: 'rr_yuzi', name: 'Yuzvendra Chahal', role: 'SPINNER', nationality: 'India', basePrice: 2.0, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/10.png' },
        { id: 'rr_hetmyer', name: 'Shimron Hetmyer', role: 'BATSMAN', nationality: 'West Indies', basePrice: 2.0, photo: 'https://ipltable.in/wp-content/uploads/2024/03/image-12-700x700.jpeg' },
        { id: 'rr_boult', name: 'Trent Boult', role: 'PACER', nationality: 'New Zealand', basePrice: 2.0, photo: 'https://ipltable.in/wp-content/uploads/2024/03/image-22-700x700.jpeg' },
        { id: 'rr_jaiswal', name: 'Yashasvi Jaiswal', role: 'BATSMAN', nationality: 'India', basePrice: 2.0, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2025/533.png' },
        { id: 'rr_ashwin', name: 'Ravichandran Ashwin', role: 'ALL-ROUNDER', nationality: 'India', basePrice: 2.0, photo: 'https://admin.matchtimings.com/assets/player/5a9193fa62f5bba6751e7dc1bb1b2fc1.png' },
        { id: 'rr_parag', name: 'Riyan Parag', role: 'ALL-ROUNDER', nationality: 'India', basePrice: 2.0, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2025/189.png' },
        { id: 'rr_kuldip', name: 'Kuldeep Sen', role: 'PACER', nationality: 'India', basePrice: 0.3, photo: 'https://ipltable.in/wp-content/uploads/2024/03/image-19.jpeg' },
        { id: 'rr_jurel', name: 'Dhruv Jurel', role: 'WICKET-KEEPER', nationality: 'India', basePrice: 2.0, photo: 'https://www.thebiographypoint.com/wp-content/uploads/2025/04/Dhruv-Jurel.png.webp' },
        { id: 'rr_shubhamDu', name: 'Shubham Dubey', role: 'BATSMAN', nationality: 'India', basePrice: 0.5, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2025/3112.png' },
        { id: 'rr_tomKohler', name: 'Tom Kohler-Cadmore', role: 'WICKET-KEEPER', nationality: 'England', basePrice: 0.5, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/3113.png' },
        { id: 'rr_powell', name: 'Rovman Powell', role: 'ALL-ROUNDER', nationality: 'West Indies', basePrice: 1.5, photo: 'https://iplcricbet.com/wp-content/uploads/2024/05/Rovman-Powell.jpg' },
        { id: 'rr_ksRathore', name: 'Kunal Singh Rathore', role: 'WICKET-KEEPER', nationality: 'India', basePrice: 0.3, photo: 'https://pbs.twimg.com/media/GISAhZ7bkAAh9Nd.jpg' },
        { id: 'rr_ferreira', name: 'Donovan Ferreira', role: 'ALL-ROUNDER', nationality: 'South Africa', basePrice: 1.25, photo: 'https://ipltable.in/wp-content/uploads/2024/03/image-16-700x700.jpeg' },
        { id: 'rr_tKotian', name: 'Tanush Kotian', role: 'ALL-ROUNDER', nationality: 'India', basePrice: 0.3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/3118.png' },
        { id: 'rr_avesh', name: 'Avesh Khan', role: 'PACER', nationality: 'India', basePrice: 1.75, photo: 'https://www.yolo247.site/sports/tournaments/wp-content/uploads/2024/01/AVESH-KHAN.png' },
        { id: 'rr_burger', name: 'Nandre Burger', role: 'PACER', nationality: 'South Africa', basePrice: 0.5, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/2806.png' },
        { id: 'rr_maharaj', name: 'Keshav Maharaj', role: 'SPINNER', nationality: 'South Africa', basePrice: 0.5, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/347.png' },
        { id: 'rr_saini', name: 'Navdeep Saini', role: 'PACER', nationality: 'India', basePrice: 0.3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2023/207.png' },
        { id: 'rr_sandeepS', name: 'Sandeep Sharma', role: 'PACER', nationality: 'India', basePrice: 1.0, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2025/220.png' },
        { id: 'rr_prasidhK', name: 'Prasidh Krishna', role: 'PACER', nationality: 'India', basePrice: 2.0, photo: 'https://www.iplbetonline.in/wp-content/uploads/2023/04/5105.png' },
        { id: 'rr_zampa', name: 'Adam Zampa', role: 'SPINNER', nationality: 'Australia', basePrice: 1.0, photo: 'https://iplcricbet.com/wp-content/uploads/2024/05/Adam-Zampa.jpg' },














        //* GT

        { id: 'gt_gill', name: 'Shubman Gill', role: 'BATSMAN', nationality: 'India', basePrice: 2.0, photo: 'https://www.iplbetonline.in/wp-content/uploads/2023/04/62.png' },
        { id: 'gt_rashid', name: 'Rashid Khan', role: 'SPINNER', nationality: 'Afghanistan', basePrice: 2.0, photo: 'https://www.iplbetonline.in/wp-content/uploads/2023/04/218.png' },
        { id: 'gt_miller', name: 'David Miller', role: 'BATSMAN', nationality: 'South Africa', basePrice: 1.5, photo: 'https://www.gujarattitansipl.com/static-assets/images/players/5313.png?v=5.55' },
        { id: 'gt_saha', name: 'Wriddhiman Saha', role: 'WICKET-KEEPER', nationality: 'India', basePrice: 0.75, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/225.png' },
        { id: 'gt_shami', name: 'Mohammed Shami', role: 'PACER', nationality: 'India', basePrice: 2.0, photo: 'https://ipltable.in/wp-content/uploads/2024/02/image-50-700x700.jpeg' },
        { id: 'gt_tewatia', name: 'Rahul Tewatia', role: 'ALL-ROUNDER', nationality: 'India', basePrice: 1.75, photo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm7m6F3W5QFWRGCacFTx2HxD5AeDwu63AREQ&s' },
        { id: 'gt_shahrukh', name: 'Shahrukh Khan', role: 'BATSMAN', nationality: 'India', basePrice: 0.75, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2025/590.png' },
        { id: 'gt_sudarshan', name: 'Sai Sudharsan', role: 'BATSMAN', nationality: 'India', basePrice: 1.0, photo: 'https://www.iplbetonline.in/wp-content/uploads/2023/04/976.png' },
        { id: 'gt_wade', name: 'Matthew Wade', role: 'WICKET-KEEPER', nationality: 'Australia', basePrice: 1.5, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/549.png' },
        { id: 'gt_kane', name: 'Kane Williamson', role: 'BATSMAN', nationality: 'New Zealand', basePrice: 1.5, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/65.png' },
        { id: 'gt_minz', name: 'Robin Minz', role: 'WICKET-KEEPER', nationality: 'India', basePrice: 0.3, photo: 'https://d13ir53smqqeyp.cloudfront.net/player-images/partner-image/ipl/100363.png' },
        { id: 'gt_omarzai', name: 'Azmatullah Omarzai', role: 'ALL-ROUNDER', nationality: 'Afghanistan', basePrice: 1.0, photo: 'https://www.gujarattitansipl.com/static-assets/images/players/67516.png?v=5.55' },
        { id: 'gt_abhiMano', name: 'Abhinav Manohar', role: 'ALL-ROUNDER', nationality: 'India', basePrice: 0.5, photo: 'https://www.gujarattitansipl.com/static-assets/images/players/63715.png?v=5.55' },
        { id: 'gt_shankar', name: 'Vijay Shankar', role: 'ALL-ROUNDER', nationality: 'India', basePrice: 0.5, photo: 'https://www.gujarattitansipl.com/static-assets/images/players/61738.png?v=5.55' },
        { id: 'gt_mSuthar', name: 'Manav Suthar', role: 'ALL-ROUNDER', nationality: 'India', basePrice: 0.3, photo: 'https://static.toiimg.com/photo/120687137.cms' },
        { id: 'gt_tyagi', name: 'Kartik Tyagi', role: 'PACER', nationality: 'India', basePrice: 0.3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/536.png' },
        { id: 'gt_nalkande', name: 'Darshan Nalkande', role: 'PACER', nationality: 'India', basePrice: 0.3, photo: 'https://www.gujarattitansipl.com/static-assets/images/players/67489.png?v=5.55' },
        { id: 'gt_kishore', name: 'Sai Kishore', role: 'SPINNER', nationality: 'India', basePrice: 0.75, photo: 'https://static.toiimg.com/photo/120687120.cms' },
        { id: 'gt_mohitS', name: 'Mohit Sharma', role: 'PACER', nationality: 'India', basePrice: 1.0, photo: 'https://www.gujarattitansipl.com/static-assets/images/players/63341.png?v=5.55' },
        { id: 'gt_umeshY', name: 'Umesh Yadav', role: 'PACER', nationality: 'India', basePrice: 2.0, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/21.png' },
        { id: 'gt_jayantY', name: 'Jayant Yadav', role: 'SPINNER', nationality: 'India', basePrice: 0.3, photo: 'https://static.toiimg.com/photo/120687156.cms' },
        { id: 'gt_warrier', name: 'Sandeep Warrier', role: 'PACER', nationality: 'India', basePrice: 0.3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/228.png' },
        { id: 'gt_noor', name: 'Noor Ahmad', role: 'SPINNER', nationality: 'Afghanistan', basePrice: 0.75, photo: 'https://www.gujarattitansipl.com/static-assets/images/players/71411.png?v=5.55' },
        { id: 'gt_little', name: 'Josh Little', role: 'PACER', nationality: 'Ireland', basePrice: 0.3, photo: 'https://www.gujarattitansipl.com/static-assets/images/players/66081.png?v=5.55' },
        { id: 'gt_spencerJ', name: 'Spencer Johnson', role: 'PACER', nationality: 'Australia', basePrice: 0.3, photo: 'https://www.gujarattitansipl.com/static-assets/images/players/67778.png?v=5.55' },
        { id: 'gt_gurnoor', name: 'Gurnoor Brar', role: 'PACER', nationality: 'India', basePrice: 0.3, photo: 'https://d1k8sn41pix00a.cloudfront.net/media/players/photos/Gurnoor_Brar_Singh.webp' },














        //* LSG

        { id: 'lsg_klrahul', name: 'KL Rahul', role: 'WICKET-KEEPER', nationality: 'India', basePrice: 2.0, photo: 'https://iplwiki.com/wp-content/uploads/2023/12/KL-Rahul-1.png' },
        { id: 'lsg_krunal', name: 'Krunal Pandya', role: 'ALL-ROUNDER', nationality: 'India', basePrice: 1.75, photo: 'https://www.lucknowsupergiants.in/static-assets/images/players/63788.png?v=12.66' },
        { id: 'lsg_hooda', name: 'Deepak Hooda', role: 'ALL-ROUNDER', nationality: 'India', basePrice: 1.0, photo: 'https://www.lucknowsupergiants.in/static-assets/images/players/63748.png?v=12.66' },
        { id: 'lsg_markwood', name: 'Mark Wood', role: 'PACER', nationality: 'England', basePrice: 1.5, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2023/315.png' },
        { id: 'lsg_mayers', name: 'Kyle Mayers', role: 'ALL-ROUNDER', nationality: 'West Indies', basePrice: 0.75, photo: 'https://www.lucknowsupergiants.in/static-assets/images/players/57792.png?v=12.66' },
        { id: 'lsg_badoni', name: 'Ayush Badoni', role: 'BATSMAN', nationality: 'India', basePrice: 0.5, photo: 'https://www.lucknowsupergiants.in/static-assets/images/players/face/69656.png?v=12.66' },
        { id: 'lsg_dev', name: 'Devdutt Padikkal', role: 'BATSMAN', nationality: 'India', basePrice: 2.0, photo: 'https://www.lucknowsupergiants.in/static-assets/images/players/67589.png?v=12.66' },
        { id: 'lsg_bishnoi', name: 'Ravi Bishnoi', role: 'SPINNER', nationality: 'India', basePrice: 1.5, photo: 'https://www.iplbetonline.in/wp-content/uploads/2023/04/520.png' },
        { id: 'lsg_mohsin', name: 'Mohsin Khan', role: 'PACER', nationality: 'India', basePrice: 2.0, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/541.png' },
        { id: 'lsg_mayankyadav', name: 'Mayank Yadav', role: 'PACER', nationality: 'India', basePrice: 1.25, photo: 'https://www.lucknowsupergiants.in/static-assets/images/players/face/90501.png?v=12.66' },
        { id: 'lsg_arshad', name: 'Arshad Khan', role: 'PACER', nationality: 'India', basePrice: 0.5, photo: 'https://www.lucknowsupergiants.in/static-assets/images/players/82839.png?v=12.66' },
        { id: 'lsg_pooran', name: 'Nicholas Pooran', role: 'WICKET-KEEPER', nationality: 'West Indies', basePrice: 2.0, photo: 'https://www.lucknowsupergiants.in/static-assets/images/players/face/63726.png?v=12.66' },
        { id: 'lsg_qdk', name: 'Quinton de Kock', role: 'WICKET-KEEPER', nationality: 'South Africa', basePrice: 2.0, photo: 'https://www.lucknowsupergiants.in/static-assets/images/players/28035.png?v=12.66' },
        { id: 'lsg_stoinis', name: 'Marcus Stoinis', role: 'ALL-ROUNDER', nationality: 'Australia', basePrice: 2.0, photo: 'https://ipltable.in/wp-content/uploads/2024/03/image-2.jpeg' },
        { id: 'lsg_turner', name: 'Ashton Turner', role: 'BATSMAN', nationality: 'Australia', basePrice: 0.75, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/86.png' },
        { id: 'lsg_kGowtham', name: 'Krishnappa Gowtham', role: 'SPINNER', nationality: 'India', basePrice: 0.75, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/179.png' },
        { id: 'lsg_shamar', name: 'Shamar Joseph', role: 'PACER', nationality: 'West Indies', basePrice: 0.75, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2025/3105.png' },
        { id: 'lsg_haq', name: 'Naveen-ul-Haq', role: 'PACER', nationality: 'Afghanistan', basePrice: 2.0, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/639.png' },
        { id: 'lsg_arshKul', name: 'Arshin Kulkarni', role: 'ALL-ROUNDER', nationality: 'India', basePrice: 0.3, photo: 'https://images.news18.com/webstories/uploads/2024/08/image-2024-08-b76690a61c19c6ec31bcdd82f173cb0b.png' },
        { id: 'lsg_amitMish', name: 'Amit Mishra', role: 'SPINNER', nationality: 'India', basePrice: 0.3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/107.png' },
        { id: 'lsg_yudhvir', name: 'Yudhvir Singh', role: 'PACER', nationality: 'India', basePrice: 0.3, photo: 'https://www.lucknowsupergiants.in/static-assets/images/players/74054.png?v=12.66' },
        { id: 'lsg_yash', name: 'Yash Thakur', role: 'PACER', nationality: 'India', basePrice: 0.3, photo: 'https://www.iplbetonline.in/wp-content/uploads/2023/04/1550.png' },
        { id: 'lsg_mavi', name: 'Shivam Mavi', role: 'PACER', nationality: 'India', basePrice: 0.3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/154.png' },
        { id: 'lsg_manimaran', name: 'Manimaran Siddharth', role: 'SPINNER', nationality: 'India', basePrice: 0.3, photo: 'https://iplcricbet.com/wp-content/uploads/2024/05/Manimaran-Siddharth.jpg' },















        //* PBKS

        { id: 'pbks_livingstone', name: 'Liam Livingstone', role: 'ALL-ROUNDER', nationality: 'England', basePrice: 2.0, photo: 'https://www.punjabkingsipl.in/static-assets/images/players/63940.png?v=6.29' },
        { id: 'pbks_arshdeep', name: 'Arshdeep Singh', role: 'PACER', nationality: 'India', basePrice: 2.0, photo: 'https://www.punjabkingsipl.in/static-assets/images/players/67905.png?v=6.29' },
        { id: 'pbks_sam', name: 'Sam Curran', role: 'ALL-ROUNDER', nationality: 'England', basePrice: 2.0, photo: 'https://www.punjabkingsipl.in/static-assets/images/players/65584.png?v=6.29' },
        { id: 'pbks_bairstow', name: 'Jonny Bairstow', role: 'WICKET-KEEPER', nationality: 'England', basePrice: 1.5, photo: 'https://www.punjabkingsipl.in/static-assets/images/players/19394.png?v=6.29' },
        { id: 'pbks_jitesh', name: 'Jitesh Sharma', role: 'WICKET-KEEPER', nationality: 'India', basePrice: 0.5, photo: 'https://www.punjabkingsipl.in/static-assets/images/players/64724.png?v=6.29' },
        { id: 'pbks_prabh', name: 'Prabhsimran Singh', role: 'WICKET-KEEPER', nationality: 'India', basePrice: 0.5, photo: 'https://www.punjabkingsipl.in/static-assets/images/players/70222.png?v=6.29' },
        { id: 'pbks_ashutosh', name: 'Ashutosh Sharma', role: 'BATSMAN', nationality: 'India', basePrice: 1.0, photo: 'https://www.punjabkingsipl.in/static-assets/images/players/68176.png?v=6.29' },
        { id: 'pbks_shashank', name: 'Shashank Singh', role: 'BATSMAN', nationality: 'India', basePrice: 1.0, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2025/191.png' },
        { id: 'pbks_rabada', name: 'Kagiso Rabada', role: 'PACER', nationality: 'South Africa', basePrice: 1.5, photo: 'https://www.punjabkingsipl.in/static-assets/images/players/63611.png?v=6.29' },
        { id: 'pbks_ellis', name: 'Nathan Ellis', role: 'PACER', nationality: 'England', basePrice: 1.0, photo: 'https://www.punjabkingsipl.in/static-assets/images/players/70324.png?v=6.29' },
        { id: 'pbks_brar', name: 'Harpreet Brar', role: 'SPINNER', nationality: 'India', basePrice: 0.5, photo: 'https://www.punjabkingsipl.in/static-assets/images/players/70500.png?v=6.29' },
        { id: 'pbks_harshal', name: 'Harshal Patel', role: 'PACER', nationality: 'India', basePrice: 1.75, photo: 'https://www.punjabkingsipl.in/static-assets/images/players/5407.png?v=6.29' },
        { id: 'pbks_chahar', name: 'Rahul Chahar', role: 'SPINNER', nationality: 'India', basePrice: 1.0, photo: 'https://www.punjabkingsipl.in/static-assets/images/players/66823.png?v=6.29' },
        { id: 'pbks_rossouw', name: 'Rilee Rossouw', role: 'BATSMAN', nationality: 'South Africa', basePrice: 1.5, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/1426.png' },
        { id: 'pbks_rishiD', name: 'Rishi Dhawan', role: 'ALL-ROUNDER', nationality: 'India', basePrice: 0.3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/996.png' },
        { id: 'pbks_raza', name: 'Sikandar Raza', role: 'ALL-ROUNDER', nationality: 'Zimbabwe', basePrice: 0.5, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/820.png' },
        { id: 'pbks_taide', name: 'Atharva Taide', role: 'ALL-ROUNDER', nationality: 'India', basePrice: 0.3, photo: 'https://www.punjabkingsipl.in/static-assets/images/players/67910.png?v=6.29' },
        { id: 'pbks_woakes', name: 'Chris Woakes', role: 'PACER', nationality: 'England', basePrice: 1.0, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/314.png' },












        //* Bhai, yahan aur players add kar sakte ho! Bas unique ID dena mat bhoolna.

        //! New BATSMAN is here:

        { id: 'new_sarfaraz', name: 'Sarfaraz Khan', role: 'BATSMAN', nationality: 'India', basePrice: 0.75, photo: 'https://www.iplbetonline.in/wp-content/uploads/2023/04/1564.png' },
        { id: 'new_ripal', name: 'Ripal Patel', role: 'BATSMAN', nationality: 'India', basePrice: 0.3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2023/580.png' },
        { id: 'new_stevensmith', name: 'Steven Smith', role: 'BATSMAN', nationality: 'Australia', basePrice: 2, photo: 'https://www.wisden.com/static-assets/images/players/4308.png?v=23.76' },
        { id: 'new_nair', name: 'Karun Nair', role: 'BATSMAN', nationality: 'India', basePrice: 0.5, photo: 'https://www.lucknowsupergiants.in/static-assets/images/players/62297.png?v=12.67' },
        { id: 'new_duckett', name: 'Ben Duckett', role: 'BATSMAN', nationality: 'England', basePrice: 2.0, photo: 'https://www.wisden.com/static-assets/images/players/63082.png?v=23.77' },
        { id: 'new_leus', name: 'Leus du Plooy', role: 'BATSMAN', nationality: 'England', basePrice: 0.5, photo: 'https://www.gmrsports.in/static-assets/images/players/other_domestic/3382/64757.png?v=2.76' },
        { id: 'new_himmat', name: 'Himmat Singh', role: 'BATSMAN', nationality: 'India', basePrice: 0.3, photo: 'https://i0.wp.com/crictoday.com/wp-content/uploads/2025/01/himmat-singh.jpg?ssl=1' },
        { id: 'new_saurav', name: 'Saurav Chauhan', role: 'BATSMAN', nationality: 'India', basePrice: 0.3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/3114.png' },
        { id: 'new_sachinBaby', name: 'Sachin Baby', role: 'BATSMAN', nationality: 'India', basePrice: 0.3, photo: 'https://d1k8sn41pix00a.cloudfront.net/media/players/photos/SachinBaby.png' },
        { id: 'new_andreSidd', name: 'Andre Siddarth', role: 'BATSMAN', nationality: 'India', basePrice: 0.3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2025/3157.png' },
        { id: 'new_urvilPatel', name: 'Urvil Patel', role: 'BATSMAN', nationality: 'India', basePrice: 0.3, photo: 'https://www.iplbetonline.in/wp-content/uploads/2023/04/1486.png' },
        { id: 'new_suryavanshi', name: 'Vaibhav Suryavanshi', role: 'BATSMAN', nationality: 'India', basePrice: 0.3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2025/3498.png' },
        { id: 'new_priyanshArya', name: 'Priyansh Arya', role: 'BATSMAN', nationality: 'India', basePrice: 0.3, photo: 'https://www.hindustantimes.com/static-content/1y/cricket-logos/players/priyansh-arya.png' },
        { id: 'new_king', name: 'Brandon King', role: 'BATSMAN', nationality: 'West Indies', basePrice: 0.75, photo: 'https://media.cricclubs.com/documentsRep/profilePics/b25af7a9-03bc-4fce-9a74-860f6b67fc36.png' },
        { id: 'new_lewis', name: 'Evin Lewis', role: 'BATSMAN', nationality: 'West Indies', basePrice: 2.0, photo: 'https://ipl-stats-sports-mechanic.s3.ap-south-1.amazonaws.com/ipl/playerimages/Evin%20Lewis.png' },
        { id: 'new_nissanka', name: 'Pathum Nissanka', role: 'BATSMAN', nationality: 'Sri Lanka', basePrice: 0.75, photo: 'https://www.wisden.com/static-assets/images/players/66368.png?v=23.77' },






        //! New ALL-ROUNDER is here:

        { id: 'new_roston', name: 'Roston Chase', role: 'ALL-ROUNDER', nationality: 'West Indies', basePrice: 0.75, photo: 'https://cricclubs.com/documentsRep/profilePics/054c4065-0df3-4de3-8d81-b5bd0ce514f4.png' },
        { id: 'new_bracewell', name: 'Michael Bracewell', role: 'ALL-ROUNDER', nationality: 'New Zealand', basePrice: 1.5, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2023/1465.png' },
        { id: 'new_nathansmith', name: 'Nathan Smith', role: 'ALL-ROUNDER', nationality: 'New Zealand', basePrice: 1.0, photo: 'https://www.kiaoval.com/wp-content/uploads/2022/03/Nathan-Smith.png' },
        { id: 'new_chapman', name: 'Mark Chapman', role: 'ALL-ROUNDER', nationality: 'New Zealand', basePrice: 1.5, photo: 'https://d13ir53smqqeyp.cloudfront.net/fc-player-images/2064.png' },
        { id: 'new_nishant', name: 'Nishant Sindhu', role: 'ALL-ROUNDER', nationality: 'India', basePrice: 0.3, photo: 'https://www.wisden.com/static-assets/images/players/88873.png?v=23.77' },
        { id: 'new_gopal', name: 'Shreyas Gopal', role: 'ALL-ROUNDER', nationality: 'India', basePrice: 0.3, photo: 'https://rbrgloblesolution.in/IPLT2022/images/srh/gopal.png' },
        { id: 'new_rashidHusain', name: 'Rishad Hossain', role: 'ALL-ROUNDER', nationality: 'Bangladesh', basePrice: 0.75, photo: 'https://d13ir53smqqeyp.cloudfront.net/player-images/partner-image/Men/18582.png' },
        { id: 'new_bethell', name: 'Jacob Bethell', role: 'ALL-ROUNDER', nationality: 'England', basePrice: 1.25, photo: 'https://d1k8sn41pix00a.cloudfront.net/media/players/photos/Jacob_Bethell.png' },
        { id: 'new_kaminduM', name: 'Kamindu Mendis', role: 'ALL-ROUNDER', nationality: 'Sri Lanka', basePrice: 0.75, photo: 'https://www.wisden.com/static-assets/images/players/65034.png?v=23.77' },






        //! New WICKET-KEEPER is here:

        { id: 'new_tomlatham', name: 'Tom Latham', role: 'WICKET-KEEPER', nationality: 'New Zealand', basePrice: 1.5, photo: 'https://d13ir53smqqeyp.cloudfront.net/fc-player-images/1213.png' },
        { id: 'new_finnAllen', name: 'Finn Allen', role: 'WICKET-KEEPER', nationality: 'New Zealand', basePrice: 2.0, photo: 'https://www.iplbetonline.in/wp-content/uploads/2023/04/3020.png' },
        { id: 'new_timSeifert', name: 'Tim Seifert', role: 'WICKET-KEEPER', nationality: 'New Zealand', basePrice: 1.25, photo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-8ULFgHKFCDhmd5oG4wGgezLmZN3MHvf6gQ&s' },
        { id: 'new_tomBanton', name: 'Tom Banton', role: 'WICKET-KEEPER', nationality: 'England', basePrice: 2.0, photo: 'https://documents.iplt20.com/playerheadshot/ipl/284/3770.png' },
        { id: 'new_samBling', name: 'Sam Billings', role: 'WICKET-KEEPER', nationality: 'England', basePrice: 1.5, photo: 'https://images.livemint.com/img/2022/11/14/optimize/sam_billings_1668414134592_1668414137871.png' },
        { id: 'new_cox', name: 'Jordan Cox', role: 'WICKET-KEEPER', nationality: 'England', basePrice: 1.25, photo: 'https://d13ir53smqqeyp.cloudfront.net/player-images/partner-image/Men2024/20537.png' },
        { id: 'new_jagadeesan', name: 'N Jagadeesan', role: 'WICKET-KEEPER', nationality: 'India', basePrice: 0.5, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2023/97.png' },
        { id: 'new_inglis', name: 'Josh Inglis', role: 'WICKET-KEEPER', nationality: 'Australia', basePrice: 1.5, photo: 'https://www.wisden.com/static-assets/images/players/65893.png?v=23.77' },
        { id: 'new_mcdermott', name: 'Ben McDermott', role: 'WICKET-KEEPER', nationality: 'Australia', basePrice: 0.75, photo: 'https://d13ir53smqqeyp.cloudfront.net/player-images/1653.png' },
        { id: 'new_joshPhilip', name: 'Josh Philippe', role: 'WICKET-KEEPER', nationality: 'Australia', basePrice: 0.75, photo: 'https://d13ir53smqqeyp.cloudfront.net/player-images/opta-cricket/14803.png' },
        { id: 'new_aryan', name: 'Aryan Juyal', role: 'WICKET-KEEPER', nationality: 'India', basePrice: 0.3, photo: 'https://salwanschools.org.in/wp-content/uploads/2022/02/Aryan-Juyal.png' },
        { id: 'new_vinshu', name: 'Vishnu Vinod', role: 'WICKET-KEEPER', nationality: 'India', basePrice: 0.3, photo: 'https://ipltable.in/wp-content/uploads/2024/02/image-18-700x700.jpeg' },
        { id: 'new_luvnith', name: 'Luvnith Sisodia', role: 'WICKET-KEEPER', nationality: 'India', basePrice: 0.3, photo: 'https://www.wisden.com/static-assets/images/players/69879.png?v=23.77' },
        { id: 'new_carey', name: 'Alex Carey', role: 'WICKET-KEEPER', nationality: 'Australia', basePrice: 1.0, photo: 'https://documents.iplt20.com/playerheadshot/ipl/284/3882.png' },
        { id: 'new_rickelton', name: 'Ryan Rickelton', role: 'WICKET-KEEPER', nationality: 'South Africa', basePrice: 1.0, photo: 'https://www.wisden.com/static-assets/images/players/64941.png?v=23.77' },
        { id: 'new_breetzke', name: 'Matthew Breetzke', role: 'WICKET-KEEPER', nationality: 'South Africa', basePrice: 0.75, photo: 'https://www.durbanssupergiants.com/static-assets/images/players/65618.png?v=7.1' },
        { id: 'new_vansh', name: 'Vansh Bedi', role: 'WICKET-KEEPER', nationality: 'India', basePrice: 0.3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2025/3558.png' },
        { id: 'new_kusalMendis', name: 'Kusal Mendis', role: 'WICKET-KEEPER', nationality: 'Sri Lanka', basePrice: 0.75, photo: 'https://www.wisden.com/static-assets/images/players/63882.png?v=23.77' },
        { id: 'new_kusalParera', name: 'Kusal Perera', role: 'WICKET-KEEPER', nationality: 'Sri Lanka', basePrice: 0.75, photo: 'https://www.wisden.com/static-assets/images/players/11757.png?v=23.77' },





        //! New SPINNER is here:

        { id: 'new_akeal', name: 'Akeal Hosein', role: 'SPINNER', nationality: 'West Indies', basePrice: 1.0, photo: 'https://www.wisden.com/static-assets/images/players/57239.png?v=23.77' },
        { id: 'new_murugan', name: 'Murugan Ashwin', role: 'SPINNER', nationality: 'India', basePrice: .30, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2023/135.png' },
        { id: 'new_adilRashid', name: 'Adil Rashid', role: 'SPINNER', nationality: 'England', basePrice: 2.0, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2023/311.png' },
        { id: 'new_mujeebR', name: 'Mujeeb Ur Rahman', role: 'SPINNER', nationality: 'Afghanistan', basePrice: 2.0, photo: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_w_1200,q_60/lsci/db/PICTURES/CMS/320500/320501.png' },
        { id: 'new_zeeshan', name: 'Zeeshan Ansari', role: 'SPINNER', nationality: 'India', basePrice: 0.3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2025/3575.png' },
        { id: 'new_viprajN', name: 'Vipraj Nigam', role: 'SPINNER', nationality: 'India', basePrice: 0.3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2025/3560.png' },
        { id: 'new_mohitRat', name: 'Mohit Rathee', role: 'SPINNER', nationality: 'India', basePrice: 0.3, photo: 'https://www.punjabkingsipl.in/static-assets/images/players/100577.png?v=6.29' },
        { id: 'new_digveshR', name: 'Digvesh Rathi', role: 'SPINNER', nationality: 'India', basePrice: 0.3, photo: 'https://cruxpedia.org/images/thumb/d/df/Digvesh-rathi.png/300px-Digvesh-rathi.png' },
        { id: 'new_tabraizSh', name: 'Tabraiz Shamsi', role: 'SPINNER', nationality: 'South Africa', basePrice: 2.0, photo: 'https://www.wisden.com/static-assets/images/players/48191.png?v=23.77' },
        { id: 'new_jeffrey', name: 'Jeffrey Vandersay', role: 'SPINNER', nationality: 'Sri Lanka', basePrice: 0.75, photo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTAcWliHBJreCzBs1Ay229Hfmte9gPUA7IXjg&s' },





        //! New PACER is here:

        { id: 'new_hazlewood', name: 'Josh Hazlewood', role: 'PACER', nationality: 'Australia', basePrice: 2, photo: 'https://d1k8sn41pix00a.cloudfront.net/media/players/photos/Josh_Hazlewood.png' },
        { id: 'new_jamieson', name: 'Kyle Jamieson', role: 'PACER', nationality: 'New Zealand', basePrice: 1.0, photo: 'https://media.cricclubs.com/documentsRep/profilePics/24d9a19a-ab6b-4ca5-a3b7-c3ff86f91dd6.png' },
        { id: 'new_archer', name: 'Jofra Archer', role: 'PACER', nationality: 'England', basePrice: 2.0, photo: 'https://roarmarathi.com/wp-content/uploads/2023/11/181.png' },
        { id: 'new_jordan', name: 'Chris Jordan', role: 'PACER', nationality: 'England', basePrice: 1.2, photo: 'https://www.mumbaiindians.com/static-assets/images/players/large/action-shots/26718.png?v=5.64&w=400' },
        { id: 'new_lungi', name: 'Lungi Ngidi', role: 'PACER', nationality: 'South Africa', basePrice: 1.0, photo: 'https://d1k8sn41pix00a.cloudfront.net/media/players/photos/Lungi_Ngidi.png' },
        { id: 'new_ashwiniKu', name: 'Ashwani Kumar', role: 'PACER', nationality: 'India', basePrice: 0.3, photo: 'https://d1k8sn41pix00a.cloudfront.net/media/players/photos/Ashwani_Kumar.webp' },
        { id: 'new_akashS', name: 'Akash Singh', role: 'PACER', nationality: 'India', basePrice: 0.3, photo: 'https://iplcricbet.com/wp-content/uploads/2024/07/Akash-Singh.jpg' },
        { id: 'new_gurjapneet', name: 'Gurjapneet Singh', role: 'PACER', nationality: 'India', basePrice: 0.3, photo: 'https://d1k8sn41pix00a.cloudfront.net/media/players/photos/Gurjapneet_Singh.png' },
        { id: 'new_kulwant', name: 'Kulwant Khejroliya', role: 'PACER', nationality: 'India', basePrice: 0.3, photo: 'https://pbs.twimg.com/media/FzmvbSUWYAEUvq-.png' },
        { id: 'new_prince', name: 'Prince Yadav', role: 'PACER', nationality: 'India', basePrice: 0.3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2025/1225.png' },
        { id: 'new_abhinandan', name: 'Abhinandan Singh', role: 'PACER', nationality: 'India', basePrice: 0.3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2025/3574.png' },




    ];




    // allPlayersData object bana rahe hain quick lookup ke liye.
    allKnownPlayers.forEach(player => {
        allPlayersData[player.id] = {
            ...player,
            // Photo ke liye simple placeholder.
            photo: player.photo || `https://via.placeholder.com/120x120?text=${player.name.split(' ')[0][0]}${player.name.split(' ')[1] ? player.name.split(' ')[1][0] : player.name[0]}`
        };
    });

    // Har team ke 2024 ke squad ki list yahan hai, player ID aur unki 2024 price ke saath.
    // Dhyan se! Jo ID yahan hai, wo 'allKnownPlayers' mein hona hi chahiye.


    const teamSquads2024 = {



        'RCB': [
            { id: 'rcb_vk', price: 15.0 }, { id: 'rcb_fdp', price: 7.0 }, { id: 'rcb_max', price: 11.0 },
            { id: 'rcb_siraj', price: 6.5 }, { id: 'rcb_akshdeep', price: 0.75 }, { id: 'rcb_sdu', price: 0.75 },
            { id: 'rcb_loma', price: 1.25 }, { id: 'rcb_rapa', price: 9.0 }, { id: 'rcb_dayal', price: 5.0 },
            { id: 'rcb_jack', price: 8.0 }, { id: 'rcb_green', price: 10.5 }, { id: 'rcb_anujrawat', price: 1.5 },
            { id: 'rcb_lokie', price: 6.0 }, { id: 'rcb_karn', price: 4.0 }, { id: 'rcb_himanshu', price: 0.5 },
            { id: 'rcb_rajan', price: 0.5 }, { id: 'rcb_dagar', price: 0.5 }, { id: 'rcb_vyshak', price: 0.5 },
            { id: 'rcb_alzarri', price: 4.0 }, { id: 'rcb_tomcurr', price: 4.0 }, { id: 'rcb_topley', price: 4.0 }
        ],




        'MI': [
            { id: 'mi_rohit', price: 16.0 }, { id: 'mi_sky', price: 15.0 }, { id: 'mi_bum', price: 12.0 },
            { id: 'mi_ishan', price: 8.25 }, { id: 'mi_tilak', price: 1.7 }, { id: 'mi_wadhera', price: 5.0 },
            { id: 'mi_dew', price: 3.0 }, { id: 'mi_tim', price: 8.25 }, { id: 'mi_chawla', price: 0.8 },
            { id: 'mi_hardik', price: 14.0 }, { id: 'mi_romario', price: 3.0 }, { id: 'mi_namanDhir', price: 3.0 },
            { id: 'mi_nabi', price: 4.0 }, { id: 'mi_coetzee', price: 5.75 }, { id: 'mi_kartikeya', price: 1.5 },
            { id: 'mi_madhwal', price: 2.0 }, { id: 'mi_tendulkar', price: 4.0 }, { id: 'mi_thushara', price: 2.5 },
            { id: 'mi_maphaka', price: 0.75 }, { id: 'mi_kamboj', price: 0.75 }, { id: 'mi_lukewood', price: 1.5 },
            { id: 'mi_behrendorff', price: 5.5 }, { id: 'mi_madushanka', price: 2.0 }
        ],




        'CSK': [
            { id: 'csk_msd', price: 10.0 }, { id: 'csk_jadeja', price: 14.0 }, { id: 'csk_rtj', price: 8.0 },
            { id: 'csk_conway', price: 6.0 }, { id: 'csk_deepak', price: 8.70 }, { id: 'csk_moeen', price: 5.40 },
            { id: 'csk_dube', price: 10.0 }, { id: 'csk_pathirana', price: 5.0 }, { id: 'csk_santner', price: 1.9 },
            { id: 'csk_daryl', price: 4.9 }, { id: 'csk_tushar', price: 1.5 }, { id: 'csk_rahane', price: 4.8 },
            { id: 'csk_rizvi', price: 1.0 }, { id: 'csk_shaikRasheed', price: 0.75 }, { id: 'csk_rachin', price: 4.0 },
            { id: 'csk_gleeson', price: 2.0 }, { id: 'csk_mukeshCh', price: 1.0 }, { id: 'csk_mustafizurR', price: 1.7 },
            { id: 'csk_simarjeetS', price: 1.5 }, { id: 'csk_shardul', price: 5.0 }, { id: 'csk_theekshana', price: 4.0 }
        ],




        'DC': [
            { id: 'dc_pant', price: 13.0 }, { id: 'dc_warner', price: 6.25 }, { id: 'dc_axar', price: 9.0 },
            { id: 'dc_shaw', price: 7.5 }, { id: 'dc_anrich', price: 6.5 }, { id: 'dc_marsh', price: 6.5 },
            { id: 'dc_kuldeep', price: 2.0 }, { id: 'dc_mukeshKu', price: 4.55 }, { id: 'dc_abhiPorel', price: 4.8 },
            { id: 'dc_chikara', price: 0.55 }, { id: 'dc_yashDhul', price: 0.6 }, { id: 'dc_jakeFraser', price: 6.0 },
            { id: 'dc_hope', price: 3.5 }, { id: 'dc_kushagra', price: 0.5 }, { id: 'dc_stubbs', price: 7.0 },
            { id: 'dc_brook', price: 5.0 }, { id: 'dc_lalitYa', price: 0.5 }, { id: 'dc_khaleel', price: 5.5 },
            { id: 'dc_praveenDu', price: 0.5 }, { id: 'dc_ostwal', price: 0.5 }, { id: 'dc_rasikhDar', price: 5.0 },
            { id: 'dc_jhyeRich', price: 1.0 }, { id: 'dc_ishantS', price: 6.0 }, { id: 'dc_lizaadW', price: 2.0 }
        ],




        'KKR': [
            { id: 'kkr_iyer', price: 12.25 }, { id: 'kkr_russell', price: 11.0 }, { id: 'kkr_narine', price: 8.0 },
            { id: 'kkr_rana', price: 8.0 }, { id: 'kkr_varun', price: 8.0 }, { id: 'kkr_vc', price: 8.0 },
            { id: 'kkr_rinku', price: 8.0 }, { id: 'kkr_manishPan', price: 5.0 }, { id: 'kkr_ksbharat', price: 2.0 },
            { id: 'kkr_salt', price: 8.0 }, { id: 'kkr_gurbaz', price: 6.0 }, { id: 'kkr_angkrishR', price: 4.0 },
            { id: 'kkr_ramandeepS', price: 5.0 }, { id: 'kkr_rutherford', price: 3.6 }, { id: 'kkr_anukulRoy', price: 1.0 },
            { id: 'kkr_arora', price: 3.0 }, { id: 'kkr_chamera', price: 3.7 }, { id: 'kkr_ghazanfar', price: 2.6 },
            { id: 'kkr_harshitR', price: 6.0 }, { id: 'kkr_chetanS', price: 0.5 }, { id: 'kkr_starc', price: 10.0 },
            { id: 'kkr_sakibHus', price: 0.4 }, { id: 'kkr_suyashS', price: 5.0 }
        ],




        'SRH': [
            { id: 'srh_klaasen', price: 16.0 }, { id: 'srh_cummins', price: 14.0 }, { id: 'srh_head', price: 14.0 },
            { id: 'srh_markram', price: 3.6 }, { id: 'srh_bhuvi', price: 9.2 }, { id: 'srh_abhishekS', price: 13.0 },
            { id: 'srh_tripathi', price: 8.5 }, { id: 'srh_umran', price: 4.0 }, { id: 'srh_abdul', price: 2.0 },
            { id: 'srh_washington', price: 8.75 }, { id: 'srh_nattu', price: 4.0 }, { id: 'srh_philips', price: 4.5 },
            { id: 'srh_farooqi', price: 0.5 }, { id: 'srh_mayank', price: 4.25 }, { id: 'srh_mJansen', price: 5.0 },
            { id: 'srh_nkReddy', price: 8.0 }, { id: 'srh_shahbaz', price: 3.0 }, { id: 'srh_mMarkande', price: 2.0 },
            { id: 'srh_anmolpret', price: 0.5 }, { id: 'srh_unadkat', price: 3.5 }
        ],





        'RR': [
            { id: 'rr_sanju', price: 14.0 }, { id: 'rr_buttler', price: 10.0 }, { id: 'rr_yuzi', price: 6.5 },
            { id: 'rr_hetmyer', price: 8.5 }, { id: 'rr_boult', price: 8.0 }, { id: 'rr_jaiswal', price: 8.0 },
            { id: 'rr_ashwin', price: 6.0 }, { id: 'rr_parag', price: 7.8 }, { id: 'rr_kuldip', price: 0.5 },
            { id: 'rr_jurel', price: 5.0 }, { id: 'rr_shubhamDu', price: 3.0 }, { id: 'rr_tomKohler', price: 3.0 },
            { id: 'rr_powell', price: 5.6 }, { id: 'rr_ksRathore', price: 0.5 }, { id: 'rr_ferreira', price: 4.8 },
            { id: 'rr_tKotian', price: 0.5 }, { id: 'rr_avesh', price: 5.7 }, { id: 'rr_burger', price: 4.9 },
            { id: 'rr_maharaj', price: 2.7 }, { id: 'rr_saini', price: 0.7 }, { id: 'rr_sandeepS', price: 5.0 },
            { id: 'rr_prasidhK', price: 6.2 }, { id: 'rr_zampa', price: 3.4 }
        ],




        'GT': [
            { id: 'gt_gill', price: 8.0 }, { id: 'gt_rashid', price: 14.0 }, { id: 'gt_miller', price: 3.0 },
            { id: 'gt_saha', price: 1.9 }, { id: 'gt_shami', price: 6.25 }, { id: 'gt_tewatia', price: 4.0 },
            { id: 'gt_sudarshan', price: 7.5 }, { id: 'gt_shahrukh', price: 3.9 }, { id: 'gt_wade', price: 4.5 },
            { id: 'gt_minz', price: 0.5 }, { id: 'gt_omarzai', price: 4.3 }, { id: 'gt_abhiMano', price: 0.75 },
            { id: 'gt_shankar', price: 2.5 }, { id: 'gt_mSuthar', price: 0.6 }, { id: 'gt_tyagi', price: 0.5 },
            { id: 'gt_nalkande', price: 0.5 }, { id: 'gt_mohitS', price: 3.8 }, { id: 'gt_umeshY', price: 4.0 },
            { id: 'gt_warrier', price: 0.6 }, { id: 'gt_noor', price: 6.0 }, { id: 'gt_little', price: 0.7 },
            { id: 'gt_kane', price: 5.4 }, { id: 'gt_kishore', price: 6.0 }, { id: 'gt_jayantY', price: 0.5 },
            { id: 'gt_spencerJ', price: 2.0 }, { id: 'gt_gurnoor', price: 0.5 }
        ],




        'LSG': [
            { id: 'lsg_klrahul', price: 13.0 }, { id: 'lsg_krunal', price: 8.25 }, { id: 'lsg_hooda', price: 5.75 },
            { id: 'lsg_markwood', price: 7.5 }, { id: 'lsg_mayers', price: 3.6 }, { id: 'lsg_badoni', price: 4.0 },
            { id: 'lsg_bishnoi', price: 4.0 }, { id: 'isg_mohsin', price: 5.0 }, { id: 'lsg_pooran', price: 16.0 },
            { id: 'lsg_stoinis', price: 11.0 }, { id: 'lsg_arshad', price: 1.0 }, { id: 'lsg_mayankyadav', price: 7.5 },
            { id: 'lsg_qdk', price: 9.0 }, { id: 'lsg_dev', price: 4.0 }, { id: 'lsg_turner', price: 1.5 },
            { id: 'lsg_kGowtham', price: 1.9 }, { id: 'lsg_shamar', price: 2.0 }, { id: 'lsg_haq', price: 3.0 },
            { id: 'lsg_arshKul', price: 0.5 }, { id: 'lsg_amitMish', price: 0.6 }, { id: 'lsg_yudhvir', price: 0.5 },
            { id: 'lsg_yash', price: 0.5 }, { id: 'lsg_mavi', price: 0.4 }, { id: 'lsg_manimaran', price: 0.5 }
        ],




        'PBKS': [
            { id: 'pbks_livingstone', price: 11.5 }, { id: 'pbks_arshdeep', price: 8.0 }, { id: 'pbks_sam', price: 7.5 },
            { id: 'pbks_bairstow', price: 6.75 }, { id: 'pbks_jitesh', price: 2.2 }, { id: 'pbks_rabada', price: 9.25 },
            { id: 'pbks_prabh', price: 4.0 }, { id: 'pbks_brar', price: 2.0 }, { id: 'pbks_chahar', price: 1.2 },
            { id: 'pbks_harshal', price: 5.0 }, { id: 'pbks_ashutosh', price: 4.0 }, { id: 'pbks_shashank', price: 5.5 },
            { id: 'pbks_ellis', price: 2.7 }, { id: 'pbks_rossouw', price: 4.0 }, { id: 'pbks_rishiD', price: 0.7 },
            { id: 'pbks_raza', price: 2.0 }, { id: 'pbks_taide', price: 0.6 }, { id: 'pbks_woakes', price: 3.9 }

            // Yahan new players ko add kar sakte ho 2024 squad mein, agar unka ID 'allKnownPlayers' mein ho.
            // Jaise: { id: 'new_player_a', price: 2.0 } agar 'new_player_a' RCB ke 2024 squad mein chahiye.
        ]
    };

    // allPlayersData object bana rahe hain quick lookup ke liye.
    allKnownPlayers.forEach(player => {
        allPlayersData[player.id] = {
            ...player,
            // Photo ke liye simple placeholder.
            photo: player.photo || `https://via.placeholder.com/120x120?text=${player.name.split(' ')[0][0]}${player.name.split(' ')[1] ? player.name.split(' ')[1][0] : player.name[0]}`
        };
    });

    // Har team ke 2024 squad ko assign karte hain.
    TEAMS.forEach(team => {
        if (teamSquads2024[team.id]) {
            team.squad2024 = teamSquads2024[team.id].map(pData => {
                const playerDetails = allPlayersData[pData.id];
                if (!playerDetails) {
                    // Agar koi player ID allKnownPlayers mein nahi mila, toh console mein error dikha do.
                    console.error(`Error: Player with ID '${pData.id}' for ${team.name} 2024 squad not found in allKnownPlayers. Please check your data!`);
                    return null; // Null return kar do, taaki filtered ho jaye.
                }
                return { ...playerDetails, price: pData.price };
            }).filter(player => player !== null); // Jo players nahi mile, unhe hata do.
        } else {
            console.warn(`Warning: No 2024 squad defined for team ${team.name}. Setting an empty squad.`);
            team.squad2024 = []; // Agar squad define nahi kiya, toh empty array set kar do.
        }
    });

    // Auction ke liye players ki list abhi empty hai, retention ke baad fill karenge.
    availablePlayers = [];
}










// --- LOCAL STORAGE LOGIC ---
// Game state ko local storage mein save karo.
function saveGameState() {
    const gameState = {
        TEAMS: TEAMS,
        availablePlayers: availablePlayers,
        currentAuctionPlayer: currentAuctionPlayer,
        currentHighestBid: currentHighestBid,
        highestBidderTeamId: highestBidderTeamId,
        previousHighestBid: previousHighestBid,
        previousHighestBidderTeamId: previousHighestBidderTeamId,
        userSelectedTeamId: userSelectedTeamId,
        auctionLog: auctionLog
    };
    localStorage.setItem('iplAuctionGameState', JSON.stringify(gameState));
    console.log('Game state saved to local storage.');
}

// Local storage se game state load karo.
function loadGameState() {
    const savedState = localStorage.getItem('iplAuctionGameState');
    if (savedState) {
        const gameState = JSON.parse(savedState);

        // Saved data ko restore karo
        TEAMS.forEach(team => {
            const savedTeam = gameState.TEAMS.find(t => t.id === team.id);
            if (savedTeam) {
                team.purse = savedTeam.purse;
                team.squad = savedTeam.squad;
                team.retainedPlayers = savedTeam.retainedPlayers;
            }
        });

        availablePlayers = gameState.availablePlayers;
        currentAuctionPlayer = gameState.currentAuctionPlayer;
        currentHighestBid = gameState.currentHighestBid;
        highestBidderTeamId = gameState.highestBidderTeamId;
        previousHighestBid = gameState.previousHighestBid;
        previousHighestBidderTeamId = gameState.previousHighestBidderTeamId;
        userSelectedTeamId = gameState.userSelectedTeamId;
        auctionLog = gameState.auctionLog;

        // UI ko updated state ke hisaab se dikhao
        document.getElementById('team-selection-area').classList.add('hidden');
        auctionBoard.classList.remove('hidden');
        document.getElementById('auction-log-area').classList.remove('hidden');

        // Auction log ko render karo
        auctionLogList.innerHTML = ''; // Pehle ka log clear karo
        auctionLog.forEach(logEntry => {
            const listItem = document.createElement('li');
            listItem.textContent = logEntry.message;
            if (logEntry.className) {
                listItem.classList.add(logEntry.className);
            }
            auctionLogList.prepend(listItem);
        });

        if (currentAuctionPlayer) {
            updateAuctionBoard();
            startTimer();
        } else {
            // Agar saare players auction ho chuke hain, to endAuction call karo
            if (availablePlayers.length === 0) {
                endAuction();
            } else {
                // Agar current player nahi hai, to next auction shuru karo
                startAuction();
            }
        }

        console.log('Game state loaded successfully!');
        alert('Saved game loaded successfully!');
        return true; // Game load ho gaya
    }
    return false; // Koi saved game nahi mila
}

// Saved game ko clear karne ke liye
function clearSavedGame() {
    localStorage.removeItem('iplAuctionGameState');
    window.location.reload(); // Page ko reload karo taaki game reset ho jaye
}
// --- LOCAL STORAGE LOGIC ENDS ---


// --- UI Initialization ---
function renderTeamSelection() {
    teamButtonsContainer.innerHTML = '';
    TEAMS.forEach(team => {
        const button = document.createElement('button');
        button.classList.add('team-btn');
        button.textContent = team.name;
        button.dataset.teamId = team.id;
        button.addEventListener('click', () => selectUserTeam(team.id));
        teamButtonsContainer.appendChild(button);
    });
}

function selectUserTeam(teamId) {
    userSelectedTeamId = teamId;
    // ... (rest of the selectUserTeam function is unchanged) ...
    document.querySelectorAll('.team-btn').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.dataset.teamId === teamId) {
            btn.classList.add('selected');
        }
    });

    const userTeam = TEAMS.find(t => t.id === userSelectedTeamId);
    selectedTeamNameSpan.textContent = userTeam.name;
    renderRetentionList(userTeam.squad2024);
    userTeamDetailsSection.classList.remove('hidden');
}

function renderRetentionList(squad2024) {
    retentionListDiv.innerHTML = '';
    squad2024.sort((a, b) => a.name.localeCompare(b.name)).forEach(player => {
        const div = document.createElement('div');
        div.classList.add('retention-player-item');
        div.innerHTML = `
            <label>
                <input type="checkbox" data-player-id="${player.id}">
                ${player.name} (${player.role}) - ₹${player.price.toFixed(1)} Cr
            </label>
        `;
        retentionListDiv.appendChild(div);
    });
}

// --- Retention Logic ---
confirmRetentionBtn.addEventListener('click', () => {
    const userTeam = TEAMS.find(t => t.id === userSelectedTeamId);
    const selectedCheckboxes = retentionListDiv.querySelectorAll('input[type="checkbox"]:checked');

    if (selectedCheckboxes.length > 6) {
        alert('Boss, zyada se zyada 6 players hi retain kar sakte ho!');
        return;
    }

    userTeam.retainedPlayers = Array.from(selectedCheckboxes).map(checkbox => {
        const playerId = checkbox.dataset.playerId;
        const playerDetails = allPlayersData[playerId];
        const player2024Price = userTeam.squad2024.find(p => p.id === playerId).price;
        return { ...playerDetails, price: player2024Price };
    });

    userTeam.retainedPlayers.forEach(player => {
        userTeam.purse -= player.price;
    });

    retainPlayersForOtherTeams();
    determineAuctionPool();

    alert(`${userTeam.retainedPlayers.length} players retain ho gaye ${userTeam.name} ke liye. Ab auction shuru hoga!`);
    document.getElementById('team-selection-area').classList.add('hidden');
    auctionBoard.classList.remove('hidden');
    document.getElementById('auction-log-area').classList.remove('hidden');

    saveGameState(); // Retention ke baad game state save karo
    startAuction();
});

function retainPlayersForOtherTeams() {
    TEAMS.filter(team => team.id !== userSelectedTeamId).forEach(team => {
        const sortedSquad = team.squad2024.sort((a, b) => b.price - a.price);

        const numToRetain = Math.floor(Math.random() * 4) + 2; // 2 se 5 players
        team.retainedPlayers = sortedSquad.slice(0, numToRetain);

        team.retainedPlayers.forEach(player => {
            team.purse -= player.price;
        });
        console.log(`${team.name} ne apne ${team.retainedPlayers.length} players retain kar liye.`);
    });
}

function determineAuctionPool() {
    const retainedPlayerIds = new Set();
    const playersInAny2024Squad = new Set();

    TEAMS.forEach(team => {
        team.retainedPlayers.forEach(player => {
            retainedPlayerIds.add(player.id);
        });
        team.squad2024.forEach(player => {
            playersInAny2024Squad.add(player.id);
        });
    });

    availablePlayers = [];

    Object.values(allPlayersData).forEach(player => {
        if (!playersInAny2024Squad.has(player.id)) {
            availablePlayers.push(player);
        }
    });

    TEAMS.forEach(team => {
        team.squad2024.forEach(player => {
            if (!retainedPlayerIds.has(player.id)) {
                if (!availablePlayers.some(p => p.id === player.id)) {
                    availablePlayers.push(allPlayersData[player.id]);
                }
            }
        });
    });

    availablePlayers.sort(() => 0.5 - Math.random());
    console.log(`Auction pool mein total players: ${availablePlayers.length}`);
}


// --- Auction Logic ---

function calculateNextBid(currentBid) {
    let nextBid = 0;

    if (currentBid < 2.0) {
        nextBid = currentBid + 0.05;
    } else {
        nextBid = currentBid + 0.25;
    }
    return parseFloat(nextBid.toFixed(2));
}

function startAuction() {
    if (availablePlayers.length === 0) {
        endAuction();
        return;
    }
    if (aiBidTimeoutId) {
        clearTimeout(aiBidTimeoutId);
        aiBidTimeoutId = null;
    }

    currentAuctionPlayer = availablePlayers.shift();

    currentHighestBid = currentAuctionPlayer.basePrice;
    highestBidderTeamId = null;
    previousHighestBid = 0;
    previousHighestBidderTeamId = null;

    teamsCurrentlyBidding.clear();

    TEAMS.forEach(team => {
        const currentTotalSquadSize = getTotalSquadSize(team);
        const currentOverseasCount = countOverseasPlayers(team);
        const isPlayerOverseas = isOverseasPlayer(currentAuctionPlayer);

        if (currentTotalSquadSize >= 25) {
            console.log(`AI ${team.name}: Cannot bid for ${currentAuctionPlayer.name} (Squad size limit reached: ${currentTotalSquadSize}/25).`);
            logAuctionEvent(`${team.name} ne apni squad limit (${currentTotalSquadSize}/25) poori kar li hai, bid nahi kar sakta.`, 'warning-log-entry');
            return;
        }

        if (isPlayerOverseas && currentOverseasCount >= 8) {
            console.log(`AI ${team.name}: Cannot bid for ${currentAuctionPlayer.name} (Overseas limit reached: ${currentOverseasCount}/8).`);
            logAuctionEvent(`${team.name} ne apni overseas limit (${currentOverseasCount}/8) poori kar li hai, bid nahi kar sakta.`, 'warning-log-entry');
            return;
        }

        if (team.purse >= currentAuctionPlayer.basePrice) {
            teamsCurrentlyBidding.add(team.id);
        } else {
            console.log(`AI ${team.name}: Cannot bid for ${currentAuctionPlayer.name} (Not enough purse: ${team.purse.toFixed(2)} Cr, required: ${currentAuctionPlayer.basePrice.toFixed(2)} Cr).`);
            logAuctionEvent(`${team.name} ke paas ${currentAuctionPlayer.name} ke liye paisa nahi hai.`, 'warning-log-entry');
        }
    });

    console.log(`Auction started for ${currentAuctionPlayer.name}. Initial bidders:`, Array.from(teamsCurrentlyBidding).map(id => TEAMS.find(t => t.id === id).name));

    if (teamsCurrentlyBidding.size === 0) {
        logAuctionEvent(`${currentAuctionPlayer.name} par koi bhi team bid nahi kar sakti (purse, squad ya overseas limit ke karan). Unsold gaya. 😔`, 'unsold-log-entry');
        console.log(`WARNING: No teams are eligible to bid for ${currentAuctionPlayer.name}. Player will be unsold immediately.`);
        // --- LOCAL STORAGE: UNSOLD hone par game state save karo ---
        saveGameState();
        setTimeout(startAuction, 2000);
        return;
    }

    updateAuctionBoard();
    startTimer();
}

function updateAuctionBoard() {
    playerPhoto.src = currentAuctionPlayer.photo;
    playerName.textContent = currentAuctionPlayer.name;
    basePriceSpan.textContent = currentAuctionPlayer.basePrice.toFixed(2);
    playerRoleSpan.textContent = currentAuctionPlayer.role;
    playerNationalitySpan.textContent = currentAuctionPlayer.nationality;
    currentHighestBidSpan.textContent = currentHighestBid.toFixed(2);
    highestBidderTeamSpan.textContent = highestBidderTeamId ? TEAMS.find(t => t.id === highestBidderTeamId).name : 'Abhi koi bid nahi';
}

function startTimer() {
    let timeLeft = AUCTION_TIME_PER_PLAYER;
    auctionTimerSpan.textContent = timeLeft;

    if (auctionTimer) clearInterval(auctionTimer);

    auctionTimer = setInterval(() => {
        if (isAuctionPaused) return;

        timeLeft--;
        auctionTimerSpan.textContent = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(auctionTimer);
            if (aiBidTimeoutId) clearTimeout(aiBidTimeoutId);

            if (highestBidderTeamId) {
                const winningTeam = TEAMS.find(t => t.id === highestBidderTeamId);
                const currentTotalSquadSize = getTotalSquadSize(winningTeam);
                const currentOverseasCount = countOverseasPlayers(winningTeam);
                const isPlayerOverseas = isOverseasPlayer(currentAuctionPlayer);

                if (currentTotalSquadSize >= 25) {
                    logAuctionEvent(`${currentAuctionPlayer.name} unsold gaya kyuki ${winningTeam.name} ne apni squad limit (${currentTotalSquadSize}/25) poori kar li thi. 😔`, 'unsold-log-entry');
                }
                else if (isPlayerOverseas && currentOverseasCount >= 8) {
                    logAuctionEvent(`${currentAuctionPlayer.name} unsold gaya kyuki ${winningTeam.name} ne overseas limit (${currentOverseasCount}/8) poori kar li thi. 😔`, 'unsold-log-entry');
                }
                else {
                    winningTeam.squad.push({ ...currentAuctionPlayer, price: currentHighestBid });
                    winningTeam.purse -= currentHighestBid;
                    logAuctionEvent(`${currentAuctionPlayer.name} ko ${winningTeam.name} ne ₹${currentHighestBid.toFixed(2)} Cr mein kharida! 🎉`, 'sold-log-entry');
                    console.log(`${winningTeam.name} ka bacha hua purse: ${winningTeam.purse.toFixed(2)} Cr`);
                }
            } else {
                logAuctionEvent(`${currentAuctionPlayer.name} unsold gaya. 😔`, 'unsold-log-entry');
            }
            // --- LOCAL STORAGE: Player sold/unsold hone par game state save karo ---
            saveGameState();
            setTimeout(startAuction, 2000);
        }
        else {
            if (highestBidderTeamId === userSelectedTeamId && timeLeft > 5) {
                if (!aiBidTimeoutId) {
                    aiBidTimeoutId = setTimeout(simulateAIBids, 500 + Math.random() * 500);
                }
            }
            else if (!highestBidderTeamId && timeLeft > 10) {
                if (!aiBidTimeoutId) {
                    aiBidTimeoutId = setTimeout(simulateAIBids, 1000 + Math.random() * 1000);
                }
            }
            else if (highestBidderTeamId !== userSelectedTeamId && timeLeft % 5 === 0 && timeLeft > 2) {
                if (!aiBidTimeoutId) {
                    aiBidTimeoutId = setTimeout(simulateAIBids, 500 + Math.random() * 1000);
                }
            }
        }
    }, 1000);

    if (!highestBidderTeamId) {
        if (aiBidTimeoutId) clearTimeout(aiBidTimeoutId);
        aiBidTimeoutId = setTimeout(simulateAIBids, 1500 + Math.random() * 1000);
    }
}


placeBidBtn.addEventListener('click', () => {
    const userNextBid = calculateNextBid(currentHighestBid);
    const userTeam = TEAMS.find(t => t.id === userSelectedTeamId);
    const isPlayerOverseas = isOverseasPlayer(currentAuctionPlayer);
    const currentUserOverseasCount = countOverseasPlayers(userTeam);
    const currentUserSquadSize = getTotalSquadSize(userTeam);

    if (currentUserSquadSize >= 25) {
        alert(`Boss, aapke paas already 25 players hain. Ab aap aur koi player nahi khareed sakte!`);
        logAuctionEvent(`${userTeam.name} ki squad size limit (${currentUserSquadSize}/25) poori ho gayi hai, bid nahi kar sakta.`, 'warning-log-entry');
        teamsCurrentlyBidding.delete(userSelectedTeamId);
        if (highestBidderTeamId === userSelectedTeamId) {
            logAuctionEvent(`${userTeam.name} ne apni bid wapas le li kyuki squad limit poori ho gayi.`, 'withdraw-log-entry');
            highestBidderTeamId = previousHighestBidderTeamId;
            currentHighestBid = previousHighestBid;
            updateAuctionBoard();
        }
        if (auctionTimer) clearInterval(auctionTimer);
        if (aiBidTimeoutId) clearTimeout(aiBidTimeoutId);
        startTimer();
        simulateAIBids();
        return;
    }

    if (isPlayerOverseas && currentUserOverseasCount >= 8) {
        alert(`Boss, aapke paas already 8 overseas players hain. Ab aap aur koi overseas player nahi khareed sakte!`);
        logAuctionEvent(`${userTeam.name} overseas player limit (${currentUserOverseasCount}/8) tak pahunch gaya hai, bid nahi kar sakta.`, 'warning-log-entry');
        teamsCurrentlyBidding.delete(userSelectedTeamId);
        if (highestBidderTeamId === userSelectedTeamId) {
            logAuctionEvent(`${userTeam.name} ne apni bid wapas le li kyuki overseas limit poori ho gayi.`, 'withdraw-log-entry');
            highestBidderTeamId = previousHighestBidderTeamId;
            currentHighestBid = previousHighestBid;
            updateAuctionBoard();
        }
        if (auctionTimer) clearInterval(auctionTimer);
        if (aiBidTimeoutId) clearTimeout(aiBidTimeoutId);
        startTimer();
        simulateAIBids();
        return;
    }

    if (userNextBid > userTeam.purse) {
        alert(`Itna paisa nahi hai tere paas! Bacha hua purse: ₹${userTeam.purse.toFixed(2)} Cr. Bid ₹${userNextBid.toFixed(2)} Cr chahiye.`);
        teamsCurrentlyBidding.delete(userSelectedTeamId);
        if (highestBidderTeamId === userSelectedTeamId) {
            logAuctionEvent(`${userTeam.name} ne apni bid wapas le li kyuki paisa nahi hai.`, 'withdraw-log-entry');
            highestBidderTeamId = previousHighestBidderTeamId;
            currentHighestBid = previousHighestBid;
            updateAuctionBoard();
        }
        if (auctionTimer) clearInterval(auctionTimer);
        if (aiBidTimeoutId) clearTimeout(aiBidTimeoutId);
        startTimer();
        simulateAIBids();
        return;
    }

    if (aiBidTimeoutId) {
        clearTimeout(aiBidTimeoutId);
        aiBidTimeoutId = null;
    }

    teamsCurrentlyBidding.add(userSelectedTeamId);
    handleBid(userSelectedTeamId, userNextBid);

    // --- LOCAL STORAGE: User bid karne par game state save karo ---
    saveGameState();
});

skipBidBtn.addEventListener('click', () => {
    const userTeam = TEAMS.find(t => t.id === userSelectedTeamId);

    if (auctionTimer) clearInterval(auctionTimer);
    if (aiBidTimeoutId) {
        clearTimeout(aiBidTimeoutId);
        aiBidTimeoutId = null;
    }

    let finalWinningTeamId = null;
    let finalWinningBid = 0;

    if (highestBidderTeamId === userSelectedTeamId) {
        if (previousHighestBidderTeamId) {
            finalWinningTeamId = previousHighestBidderTeamId;
            finalWinningBid = previousHighestBid;
        }
    } else {
        if (highestBidderTeamId) {
            finalWinningTeamId = highestBidderTeamId;
            finalWinningBid = currentHighestBid;
        }
    }

    if (finalWinningTeamId) {
        const winningTeam = TEAMS.find(t => t.id === finalWinningTeamId);
        const currentTotalSquadSize = getTotalSquadSize(winningTeam);
        const currentOverseasCount = countOverseasPlayers(winningTeam);
        const isPlayerOverseas = isOverseasPlayer(currentAuctionPlayer);

        if (currentTotalSquadSize >= 25) {
            logAuctionEvent(`${userTeam.name} ne skip kiya. ${currentAuctionPlayer.name} unsold gaya kyuki ${winningTeam.name} ne apni squad limit (${currentTotalSquadSize}/25) poori kar li thi. 😔`, 'unsold-log-entry');
        }
        else if (isPlayerOverseas && currentOverseasCount >= 8) {
            logAuctionEvent(`${userTeam.name} ne skip kiya. ${currentAuctionPlayer.name} unsold gaya kyuki ${winningTeam.name} ne overseas limit (${currentOverseasCount}/8) poori kar li thi. 😔`, 'unsold-log-entry');
        }
        else {
            winningTeam.squad.push({ ...currentAuctionPlayer, price: finalWinningBid });
            winningTeam.purse -= finalWinningBid;
            logAuctionEvent(`${userTeam.name} ne skip kiya. ${currentAuctionPlayer.name} ko ${winningTeam.name} ne ₹${finalWinningBid.toFixed(2)} Cr mein kharida! 🎉`, 'sold-log-entry');
            console.log(`${winningTeam.name} ka bacha hua purse: ${winningTeam.purse.toFixed(2)} Cr`);
        }
    } else {
        logAuctionEvent(`${userTeam.name} ne skip kiya. ${currentAuctionPlayer.name} unsold gaya. 😔`, 'unsold-log-entry');
    }
    // --- LOCAL STORAGE: Skip karne par bhi game state save karo ---
    saveGameState();
    setTimeout(startAuction, 2000);
});

function simulateAIBids() {
    if (isAuctionPaused) return;
    if (aiBidTimeoutId) {
        clearTimeout(aiBidTimeoutId);
        aiBidTimeoutId = null;
    }

    const potentialAIBidders = TEAMS.filter(team => {
        if (team.id === highestBidderTeamId || team.id === userSelectedTeamId) return false;

        const currentTotalSquadSize = getTotalSquadSize(team);
        const currentOverseasCount = countOverseasPlayers(team);
        const isPlayerOverseas = isOverseasPlayer(currentAuctionPlayer);

        if (currentTotalSquadSize >= 25) return false;
        if (isPlayerOverseas && currentOverseasCount >= 8) return false;

        const aiNextBid = calculateNextBid(currentHighestBid);
        if (team.purse < aiNextBid) return false;
        return true;
    });

    if (potentialAIBidders.length === 0) {
        return;
    }

    potentialAIBidders.sort(() => 0.5 - Math.random());

    for (const team of potentialAIBidders) {
        if (team.id === highestBidderTeamId) continue;

        let aiNextBid = calculateNextBid(currentHighestBid);

        const baseValue = currentAuctionPlayer.basePrice;
        let aiMaxBidMultiplier = 2.5 + Math.random() * 2.5;
        if (currentAuctionPlayer.role === 'ALL-ROUNDER' || currentAuctionPlayer.basePrice >= 2.0) {
            aiMaxBidMultiplier += 1.0;
        }
        const aiCalculatedMaxBid = parseFloat((baseValue * aiMaxBidMultiplier).toFixed(2));

        const remainingPursePercentage = team.purse / team.budget;
        let purseWillingness = 0.1 + Math.random() * 0.2;
        if (remainingPursePercentage < 0.3) {
            purseWillingness = 0.05 + Math.random() * 0.1;
        }
        const aiPurseLimit = team.purse;

        let potentialBid = aiNextBid;

        if (potentialBid > aiCalculatedMaxBid) {
            continue;
        }
        if (potentialBid > aiPurseLimit) {
            continue;
        }

        let finalAIBid = potentialBid;
        finalAIBid = parseFloat(finalAIBid.toFixed(2));

        if (finalAIBid > currentHighestBid && finalAIBid <= team.purse) {
            handleBid(team.id, finalAIBid);
            // --- LOCAL STORAGE: AI bid karne par game state save karo ---
            saveGameState();
            aiBidTimeoutId = setTimeout(simulateAIBids, 800 + Math.random() * 1200);
            return;
        }
    }
}


function handleBid(teamId, bidAmount) {
    bidAmount = parseFloat(bidAmount.toFixed(2));

    previousHighestBid = currentHighestBid;
    previousHighestBidderTeamId = highestBidderTeamId;

    if (bidAmount > currentHighestBid) {
        currentHighestBid = bidAmount;
        highestBidderTeamId = teamId;
        updateAuctionBoard();
        logAuctionEvent(`${TEAMS.find(t => t.id === teamId).name} ne bid ki ₹${bidAmount.toFixed(2)} Cr.`);

        if (auctionTimer) clearInterval(auctionTimer);
        if (aiBidTimeoutId) {
            clearTimeout(aiBidTimeoutId);
            aiBidTimeoutId = null;
        }

        if (teamId === userSelectedTeamId) {
            aiBidTimeoutId = setTimeout(simulateAIBids, 700 + Math.random() * 800);
        } else {
        }
        startTimer();
    }
}

function logAuctionEvent(message, className = '') {
    const listItem = document.createElement('li');
    listItem.textContent = message;
    if (className) {
        listItem.classList.add(className);
    }
    auctionLogList.prepend(listItem);
    if (auctionLogList.children.length > 50) {
        auctionLogList.removeChild(auctionLogList.lastChild);
    }
    // --- LOCAL STORAGE: Log ko bhi save karo ---
    auctionLog.unshift({ message: message, className: className });
    if (auctionLog.length > 50) {
        auctionLog.pop();
    }
}

function endAuction() {
    clearInterval(auctionTimer);
    if (aiBidTimeoutId) clearTimeout(aiBidTimeoutId);
    alert('Auction Khatam! Final squads dekh lo.');
    // --- LOCAL STORAGE: Auction khatam hone par game state clear karo ---
    localStorage.removeItem('iplAuctionGameState');
    showCurrentSquads();
    detailsPopup.classList.remove('hidden');
}

// --- Auction Details Pop-up Logic ---
auctionDetailsBtn.addEventListener('click', () => {
    isAuctionPaused = true;
    if (auctionTimer) clearInterval(auctionTimer);
    if (aiBidTimeoutId) clearTimeout(aiBidTimeoutId);
    detailsPopup.classList.remove('hidden');
});

closeDetailsBtn.addEventListener('click', () => {
    isAuctionPaused = false;
    detailsPopup.classList.add('hidden');
    if (currentAuctionPlayer) {
        startTimer();
    }
});

playerListBtn.addEventListener('click', showPlayerList);
purseRemainingBtn.addEventListener('click', showPurseRemaining);
currentSquadBtn.addEventListener('click', showCurrentSquads);
clearSavedGameBtn.addEventListener('click', clearSavedGame);

function showPlayerList() {
    detailsView.innerHTML = `
        <h3>Auction mein bache hue players (abhi tak unauctioned)</h3>
        <table>
            <thead>
                <tr>
                    <th>Naam</th>
                    <th>Role</th>
                    <th>Nationality</th>
                    <th>Base Price (Cr)</th>
                </tr>
            </thead>
            <tbody id="player-list-table-body">
            </tbody>
        </table>
    `;
    const tbody = document.getElementById('player-list-table-body');

    const currentAuctionPoolDisplay = [];
    const acquiredPlayerIds = new Set();

    TEAMS.forEach(team => {
        team.retainedPlayers.forEach(p => acquiredPlayerIds.add(p.id));
        team.squad.forEach(p => acquiredPlayerIds.add(p.id));
    });

    Object.values(allPlayersData).forEach(player => {
        if (!acquiredPlayerIds.has(player.id)) {
            currentAuctionPoolDisplay.push(player);
        }
    });

    currentAuctionPoolDisplay.sort((a, b) => a.name.localeCompare(b.name)).forEach(player => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${player.name}</td>
            <td>${player.role}</td>
            <td>${player.nationality}</td>
            <td>${player.basePrice.toFixed(2)}</td>
        `;
        tbody.appendChild(tr);
    });
    detailsView.classList.remove('hidden');
}

function showPurseRemaining() {
    detailsView.innerHTML = `
        <h3>Saari Teams ka bacha hua Purse</h3>
        <table>
            <thead>
                <tr>
                    <th>Team</th>
                    <th>Budget (Cr)</th>
                    <th>Kharch (Cr)</th>
                    <th>Bacha hua (Cr)</th>
                    <th>Squad Size</th>
                    <th>Overseas Players</th>
                </tr>
            </thead>
            <tbody id="purse-remaining-table-body">
            </tbody>
        </table>
    `;
    const tbody = document.getElementById('purse-remaining-table-body');
    TEAMS.forEach(team => {
        const totalSquadSize = getTotalSquadSize(team);
        const overseasCount = countOverseasPlayers(team);
        const spent = team.budget - team.purse;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${team.name}</td>
            <td>${team.budget.toFixed(2)}</td>
            <td>${spent.toFixed(2)}</td>
            <td>${team.purse.toFixed(2)}</td>
            <td>${totalSquadSize}</td>
            <td>${overseasCount}</td>
        `;
        tbody.appendChild(tr);
    });
    detailsView.classList.remove('hidden');
}

function showCurrentSquads() {
    detailsView.innerHTML = `<h3>Saari Teams ke Current Squads</h3>`;
    TEAMS.forEach(team => {
        const teamSquadDiv = document.createElement('div');
        teamSquadDiv.classList.add('team-squad-section');
        teamSquadDiv.innerHTML = `<h3>${team.name} Squad (Purse: ₹${team.purse.toFixed(2)} Cr | Total Players: ${getTotalSquadSize(team)} | Overseas: ${countOverseasPlayers(team)})</h3>`;

        const fullSquad = [...team.retainedPlayers, ...team.squad];

        const roles = ['BATSMAN', 'ALL-ROUNDER', 'WICKET-KEEPER', 'SPINNER', 'PACER'];
        const groupedSquad = {};
        roles.forEach(role => groupedSquad[role] = []);

        fullSquad.forEach(player => {
            groupedSquad[player.role].push(player);
        });

        roles.forEach(role => {
            const playersInRole = groupedSquad[role];
            if (playersInRole.length > 0) {
                const roleCategoryDiv = document.createElement('div');
                roleCategoryDiv.classList.add('squad-role-category');
                roleCategoryDiv.innerHTML = `<h4>${role} (${playersInRole.length})</h4>`;
                const ul = document.createElement('ul');
                ul.classList.add('squad-player-list');
                playersInRole.sort((a, b) => b.price - a.price).forEach(player => {
                    const status = team.retainedPlayers.some(rp => rp.id === player.id) ? '(Retained)' : '';
                    const nationalityStatus = isOverseasPlayer(player) ? '(Overseas)' : '(Indian)';
                    const li = document.createElement('li');
                    li.textContent = `${player.name} - ₹${player.price.toFixed(2)} Cr ${status} ${nationalityStatus}`;
                    ul.appendChild(li);
                });
                roleCategoryDiv.appendChild(ul);
                teamSquadDiv.appendChild(roleCategoryDiv);
            }
        });
        detailsView.appendChild(teamSquadDiv);
    });
    detailsView.classList.remove('hidden');
}


// --- Initialize the game on page load ---
document.addEventListener('DOMContentLoaded', () => {
    initializeGameData();
    // --- LOCAL STORAGE: Page load hone par pehle saved game ko load karne ki koshish karo ---
    if (!loadGameState()) {
        // Agar koi saved game nahi mila, toh naya game shuru karo
        renderTeamSelection();
    }
});
