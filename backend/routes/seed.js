/**
 * Seed Route  –  GET /api/seed
 * Wipes all collections and inserts realistic demo records.
 * Unique dataset — Brieflytix original.
 */
const express      = require('express');
const router       = express.Router();
const Client       = require('../models/Client');
const Case         = require('../models/Case');
const Document     = require('../models/Document');
const Task         = require('../models/Task');
const Notification = require('../models/Notification');
const Billing      = require('../models/Billing');

/* ── Helper: relative date from today ────────────────────────────────────── */
const d = (daysFromNow) => {
  const dt = new Date();
  dt.setDate(dt.getDate() + daysFromNow);
  return dt;
};

router.get('/', async (req, res) => {
  try {
    // Safety: require ?confirm=yes query param to prevent accidental data wipe
    if (req.query.confirm !== 'yes') {
      return res.status(400).json({
        success: false,
        message: 'Add ?confirm=yes to confirm seeding. WARNING: This deletes ALL existing data!',
      });
    }

    // ── 1. Clear all collections ──────────────────────────────────────────────
    await Promise.all([
      Client.deleteMany({}),
      Case.deleteMany({}),
      Document.deleteMany({}),
      Task.deleteMany({}),
      Notification.deleteMany({}),
      Billing.deleteMany({}),
    ]);

    // ── 2. Seed Clients (10 unique clients) ───────────────────────────────────
    const clientDocs = await Client.insertMany([
      {
        name: 'Nathaniel Ashford', email: 'n.ashford@ashfordventures.com',
        phone: '+1 (929) 555-0342', company: 'Ashford Ventures Group',
        type: 'Corporate', address: '1401 K Street NW, Washington, DC 20005',
        activeCases: 3, status: 'Active', joinedDate: d(-720),
      },
      {
        name: 'Camille Beauregard', email: 'camille.b@protonmail.com',
        phone: '+1 (504) 555-0218', company: '',
        type: 'Individual', address: '935 Tchoupitoulas St, New Orleans, LA 70130',
        activeCases: 2, status: 'Active', joinedDate: d(-540),
      },
      {
        name: 'Viktor Ostrovsky', email: 'v.ostrovsky@ostraenergy.com',
        phone: '+1 (713) 555-0481', company: 'Ostra Energy Holdings',
        type: 'Corporate', address: '1200 Smith St, Houston, TX 77002',
        activeCases: 2, status: 'Active', joinedDate: d(-450),
      },
      {
        name: 'Preethi Raghavan', email: 'preethi.ragh@outlook.com',
        phone: '+1 (408) 555-0159', company: '',
        type: 'Individual', address: '2100 El Camino Real, Santa Clara, CA 95050',
        activeCases: 2, status: 'Active', joinedDate: d(-380),
      },
      {
        name: 'Desmond Whitaker', email: 'desmond@whitakergroup.com',
        phone: '+1 (404) 555-0277', company: 'Whitaker Capital Group',
        type: 'Corporate', address: '191 Peachtree St NE, Atlanta, GA 30303',
        activeCases: 2, status: 'Active', joinedDate: d(-310),
      },
      {
        name: 'Ingrid Holgersen', email: 'ingrid.h@gmail.com',
        phone: '+1 (206) 555-0396', company: '',
        type: 'Individual', address: '411 University St, Seattle, WA 98101',
        activeCases: 1, status: 'Active', joinedDate: d(-260),
      },
      {
        name: 'Rafael Quintero', email: 'r.quintero@quinterolaw.com',
        phone: '+1 (786) 555-0134', company: 'Quintero Marine Exports',
        type: 'Corporate', address: '800 Brickell Ave, Miami, FL 33131',
        activeCases: 2, status: 'Active', joinedDate: d(-200),
      },
      {
        name: 'Sienna Calloway', email: 'sienna.calloway@ymail.com',
        phone: '+1 (312) 555-0468', company: '',
        type: 'Individual', address: '230 S Wacker Dr, Chicago, IL 60606',
        activeCases: 1, status: 'Active', joinedDate: d(-150),
      },
      {
        name: 'Leo Tancredi', email: 'ltancredi@tancrediholdings.com',
        phone: '+1 (646) 555-0513', company: 'Tancredi Holdings LLC',
        type: 'Corporate', address: '200 Park Avenue, New York, NY 10166',
        activeCases: 1, status: 'Inactive', joinedDate: d(-800),
      },
      {
        name: 'Nadia El-Masri', email: 'nadia.elmasri@outlook.com',
        phone: '+1 (617) 555-0291', company: '',
        type: 'Individual', address: '1 Federal St, Boston, MA 02110',
        activeCases: 1, status: 'Active', joinedDate: d(-90),
      },
    ]);

    const [
      ashford, beauregard, ostrovsky, raghavan, whitaker,
      holgersen, quintero, calloway, tancredi, elmasri,
    ] = clientDocs;

    // ── Firm attorneys ────────────────────────────────────────────────────────
    const ATT = {
      novak:   'Elena Novak',
      garrison:'Marcus Garrison',
      delaCruz:'Isabela de la Cruz',
      okonkwo: 'Chidi Okonkwo',
      brennan: 'Fiona Brennan',
    };

    // ── 3. Seed Cases (18 diverse cases) ──────────────────────────────────────
    const caseDocs = await Case.insertMany([
      /* 0 */ {
        caseNumber: 'LX-2024-0101', title: 'Ashford Ventures – Hostile Takeover Defense',
        type: 'Corporate', status: 'Active', priority: 'High',
        clientId: ashford._id, assignedAttorney: ATT.okonkwo,
        courtDate: d(22), filingDate: d(-120),
        description: 'Defending against unsolicited $3.1B acquisition bid from Meridian Capital. Poison pill strategy under review.',
      },
      /* 1 */ {
        caseNumber: 'LX-2024-0102', title: 'Beauregard Wrongful Eviction Suit',
        type: 'Civil', status: 'Active', priority: 'High',
        clientId: beauregard._id, assignedAttorney: ATT.brennan,
        courtDate: d(35), filingDate: d(-95),
        description: 'Client wrongfully evicted from NOLA rental during lease term. Seeking $340K damages and lease reinstatement.',
      },
      /* 2 */ {
        caseNumber: 'LX-2024-0103', title: 'Ostra Energy – EPA Compliance Audit',
        type: 'Corporate', status: 'Active', priority: 'High',
        clientId: ostrovsky._id, assignedAttorney: ATT.garrison,
        courtDate: d(45), filingDate: d(-180),
        description: 'EPA compliance review of Gulf drilling operations. Preparing defense against potential Clean Water Act violations.',
      },
      /* 3 */ {
        caseNumber: 'LX-2024-0104', title: 'Raghavan – H-1B to Green Card Transition',
        type: 'Immigration', status: 'Active', priority: 'Medium',
        clientId: raghavan._id, assignedAttorney: ATT.delaCruz,
        courtDate: d(60), filingDate: d(-150),
        description: 'Employment-based EB-2 green card petition for software engineer. Labor certification in progress.',
      },
      /* 4 */ {
        caseNumber: 'LX-2024-0105', title: 'Whitaker Capital – Securities Fraud Investigation',
        type: 'Criminal', status: 'Active', priority: 'High',
        clientId: whitaker._id, assignedAttorney: ATT.novak,
        courtDate: d(28), filingDate: d(-200),
        description: 'SEC investigation into alleged insider trading surrounding Whitaker subsidiary IPO. Building defense documentation.',
      },
      /* 5 */ {
        caseNumber: 'LX-2024-0106', title: 'Holgersen v. Northwest Medical – Malpractice',
        type: 'Civil', status: 'Pending', priority: 'Medium',
        clientId: holgersen._id, assignedAttorney: ATT.brennan,
        courtDate: d(72), filingDate: d(-60),
        description: 'Medical malpractice claim following misdiagnosed condition. Expert medical opinions being compiled.',
      },
      /* 6 */ {
        caseNumber: 'LX-2024-0107', title: 'Quintero Marine – Customs & Import Violations',
        type: 'Criminal', status: 'Active', priority: 'Medium',
        clientId: quintero._id, assignedAttorney: ATT.garrison,
        courtDate: d(50), filingDate: d(-130),
        description: 'CBP alleges customs fraud on marine equipment imports. Reviewing 3 years of shipping manifests.',
      },
      /* 7 */ {
        caseNumber: 'LX-2024-0108', title: 'Calloway – Divorce & Asset Division',
        type: 'Family', status: 'Active', priority: 'High',
        clientId: calloway._id, assignedAttorney: ATT.novak,
        courtDate: d(18), filingDate: d(-85),
        description: 'High-net-worth contested divorce involving $8.5M in joint assets, 2 properties, and custody of 3 children.',
      },
      /* 8 */ {
        caseNumber: 'LX-2024-0109', title: 'Ashford Ventures – IP Licensing Dispute',
        type: 'Intellectual Property', status: 'Pending', priority: 'Medium',
        clientId: ashford._id, assignedAttorney: ATT.delaCruz,
        courtDate: d(90), filingDate: d(-70),
        description: 'Dispute over software licensing royalties with former development partner. Mediation pending.',
      },
      /* 9 */ {
        caseNumber: 'LX-2024-0110', title: 'Raghavan – Workplace Discrimination Complaint',
        type: 'Civil', status: 'Active', priority: 'Medium',
        clientId: raghavan._id, assignedAttorney: ATT.brennan,
        courtDate: d(55), filingDate: d(-100),
        description: 'Title VII workplace discrimination complaint alleging retaliation after reporting bias. EEOC filing submitted.',
      },
      /* 10 */ {
        caseNumber: 'LX-2025-0111', title: 'Ostra Energy – Pipeline Easement Negotiation',
        type: 'Corporate', status: 'Pending', priority: 'Low',
        clientId: ostrovsky._id, assignedAttorney: ATT.okonkwo,
        courtDate: null, filingDate: d(-40),
        description: 'Negotiating pipeline easement rights across three adjacent properties in west Texas.',
      },
      /* 11 */ {
        caseNumber: 'LX-2025-0112', title: 'Whitaker Capital – Employee Class Action Defense',
        type: 'Civil', status: 'Active', priority: 'High',
        clientId: whitaker._id, assignedAttorney: ATT.novak,
        courtDate: d(30), filingDate: d(-110),
        description: 'Defending against 200+ employee class action alleging unpaid overtime and wage violations.',
      },
      /* 12 */ {
        caseNumber: 'LX-2025-0113', title: 'Quintero – Maritime Insurance Claim',
        type: 'Civil', status: 'Pending', priority: 'Medium',
        clientId: quintero._id, assignedAttorney: ATT.garrison,
        courtDate: d(80), filingDate: d(-30),
        description: 'Filing $2.1M claim against Lloyds insurer for cargo vessel damage during Hurricane season.',
      },
      /* 13 */ {
        caseNumber: 'LX-2025-0114', title: 'Tancredi Holdings – Breach of Fiduciary Duty',
        type: 'Corporate', status: 'On Hold', priority: 'Low',
        clientId: tancredi._id, assignedAttorney: ATT.okonkwo,
        courtDate: d(110), filingDate: d(-250),
        description: 'Minority partner alleges fund mismanagement. Case paused pending external audit completion.',
      },
      /* 14 */ {
        caseNumber: 'LX-2025-0115', title: 'Beauregard – Child Support Modification',
        type: 'Family', status: 'Active', priority: 'Medium',
        clientId: beauregard._id, assignedAttorney: ATT.novak,
        courtDate: d(40), filingDate: d(-50),
        description: 'Petition to modify child support order based on substantial change in income circumstances.',
      },
      /* 15 */ {
        caseNumber: 'LX-2025-0116', title: 'El-Masri – Political Asylum Application',
        type: 'Immigration', status: 'Active', priority: 'High',
        clientId: elmasri._id, assignedAttorney: ATT.delaCruz,
        courtDate: d(65), filingDate: d(-75),
        description: 'Asylum petition based on credible fear of persecution. Country conditions report and witness affidavits being compiled.',
      },
      /* 16 */ {
        caseNumber: 'LX-2025-0117', title: 'Ashford Ventures – SEC 10-K Filing Review',
        type: 'Corporate', status: 'Closed', priority: 'Low',
        clientId: ashford._id, assignedAttorney: ATT.okonkwo,
        courtDate: null, filingDate: d(-300),
        description: 'Annual 10-K filing review and compliance check. Successfully filed with SEC. Case closed.',
      },
      /* 17 */ {
        caseNumber: 'LX-2025-0118', title: 'Holgersen – Workers Comp Appeal',
        type: 'Civil', status: 'Closed', priority: 'Medium',
        clientId: holgersen._id, assignedAttorney: ATT.brennan,
        courtDate: d(-30), filingDate: d(-220),
        description: 'Workers compensation appeal for denied claim. Administrative hearing won. Benefits restored.',
      },
    ]);

    // ── 4. Seed Documents (18 documents) ──────────────────────────────────────
    await Document.insertMany([
      {
        title: 'Poison Pill Rights Plan – Ashford',
        caseId: caseDocs[0]._id, type: 'Contract', status: 'Approved',
        uploadedBy: ATT.okonkwo, deadline: d(15),
        notes: 'Shareholder rights plan adopted by board to deter hostile acquisition.',
      },
      {
        title: 'Wrongful Eviction Complaint – Beauregard',
        caseId: caseDocs[1]._id, type: 'Motion', status: 'Filed',
        uploadedBy: ATT.brennan, deadline: d(10),
        notes: 'Initial complaint with exhibits showing valid lease and eviction timeline.',
      },
      {
        title: 'EPA Response Brief – Ostra Energy',
        caseId: caseDocs[2]._id, type: 'Brief', status: 'Pending Review',
        uploadedBy: ATT.garrison, deadline: d(30),
        notes: 'Detailed technical response to EPA findings with environmental consultant report attached.',
      },
      {
        title: 'PERM Labor Certification – Raghavan',
        caseId: caseDocs[3]._id, type: 'Evidence', status: 'Filed',
        uploadedBy: ATT.delaCruz, deadline: d(45),
        notes: 'DOL Form 9089 with prevailing wage determination and recruitment documentation.',
      },
      {
        title: 'SEC Defense Memorandum – Whitaker',
        caseId: caseDocs[4]._id, type: 'Brief', status: 'Draft',
        uploadedBy: ATT.novak, deadline: d(20),
        notes: 'Draft defense strategy memo addressing SEC allegations with trading timeline analysis.',
      },
      {
        title: 'Medical Expert Opinion – Holgersen',
        caseId: caseDocs[5]._id, type: 'Affidavit', status: 'Pending Review',
        uploadedBy: ATT.brennan, deadline: d(55),
        notes: 'Board-certified specialist opinion on misdiagnosis and standard of care deviation.',
      },
      {
        title: 'Customs Manifest Analysis – Quintero',
        caseId: caseDocs[6]._id, type: 'Evidence', status: 'Reviewed',
        uploadedBy: ATT.garrison, deadline: d(35),
        notes: '36-month customs filing analysis with annotated discrepancies.',
      },
      {
        title: 'Marital Asset Inventory – Calloway',
        caseId: caseDocs[7]._id, type: 'Evidence', status: 'Approved',
        uploadedBy: ATT.novak, deadline: d(12),
        notes: 'Comprehensive inventory of marital assets including real property, investments, and retirement accounts.',
      },
      {
        title: 'IP Licensing Agreement (Original) – Ashford',
        caseId: caseDocs[8]._id, type: 'Contract', status: 'Reviewed',
        uploadedBy: ATT.delaCruz, deadline: d(70),
        notes: 'Original software licensing agreement from 2021 with royalty schedule exhibits.',
      },
      {
        title: 'EEOC Charge of Discrimination – Raghavan',
        caseId: caseDocs[9]._id, type: 'Motion', status: 'Filed',
        uploadedBy: ATT.brennan, deadline: d(40),
        notes: 'Formal EEOC charge with supporting witness declarations and email evidence.',
      },
      {
        title: 'Pipeline Easement Proposal – Ostra',
        caseId: caseDocs[10]._id, type: 'Contract', status: 'Draft',
        uploadedBy: ATT.okonkwo, deadline: d(60),
        notes: 'Draft easement agreement with compensation schedule for three landowners.',
      },
      {
        title: 'Class Action Response – Whitaker',
        caseId: caseDocs[11]._id, type: 'Motion', status: 'Filed',
        uploadedBy: ATT.novak, deadline: d(25),
        notes: 'Motion to dismiss class action or alternatively to decertify the class.',
      },
      {
        title: 'Insurance Claim Package – Quintero',
        caseId: caseDocs[12]._id, type: 'Evidence', status: 'Pending Review',
        uploadedBy: ATT.garrison, deadline: d(65),
        notes: 'Marine surveyor report, repair estimates, and policy coverage analysis.',
      },
      {
        title: 'External Audit Report – Tancredi',
        caseId: caseDocs[13]._id, type: 'Evidence', status: 'Draft',
        uploadedBy: ATT.okonkwo, deadline: d(95),
        notes: 'Independent auditor preliminary findings on fund management practices.',
      },
      {
        title: 'Income Modification Petition – Beauregard',
        caseId: caseDocs[14]._id, type: 'Motion', status: 'Filed',
        uploadedBy: ATT.novak, deadline: d(32),
        notes: 'Petition with 2 years of financial records showing income change.',
      },
      {
        title: 'Asylum Country Conditions Report – El-Masri',
        caseId: caseDocs[15]._id, type: 'Brief', status: 'Approved',
        uploadedBy: ATT.delaCruz, deadline: d(50),
        notes: 'State Department country report with annotated sections relevant to client threat profile.',
      },
      {
        title: '10-K Annual Filing – Ashford (Closed)',
        caseId: caseDocs[16]._id, type: 'Order', status: 'Filed',
        uploadedBy: ATT.okonkwo, deadline: d(-280),
        notes: 'Successfully filed SEC 10-K annual report. Case closed.',
      },
      {
        title: 'Administrative Hearing Decision – Holgersen',
        caseId: caseDocs[17]._id, type: 'Order', status: 'Filed',
        uploadedBy: ATT.brennan, deadline: d(-25),
        notes: 'ALJ decision reinstating workers compensation benefits.',
      },
    ]);

    // ── 5. Seed Tasks (20 tasks) ──────────────────────────────────────────────
    await Task.insertMany([
      {
        title: 'Draft Poison Pill Board Resolution',
        description: 'Prepare board resolution for shareholder rights plan adoption.',
        caseId: caseDocs[0]._id, assignedTo: ATT.okonkwo,
        priority: 'High', status: 'Completed', dueDate: d(-5),
        completionPercentage: 100,
      },
      {
        title: 'Prepare Takeover Defense Presentation',
        description: 'Create defense strategy deck for Ashford board meeting.',
        caseId: caseDocs[0]._id, assignedTo: ATT.okonkwo,
        priority: 'High', status: 'In Progress', dueDate: d(15),
        completionPercentage: 70,
      },
      {
        title: 'Compile Eviction Timeline Evidence',
        description: 'Organize communications, lease documents, and photos for wrongful eviction claim.',
        caseId: caseDocs[1]._id, assignedTo: ATT.brennan,
        priority: 'High', status: 'In Progress', dueDate: d(20),
        completionPercentage: 60,
      },
      {
        title: 'Review EPA Environmental Reports',
        description: 'Analyze 5-year EPA inspection data for Ostra Gulf drilling sites.',
        caseId: caseDocs[2]._id, assignedTo: ATT.garrison,
        priority: 'High', status: 'In Progress', dueDate: d(25),
        completionPercentage: 45,
      },
      {
        title: 'Prepare PERM Recruitment Ads',
        description: 'Draft and place legally required job advertisements for labor certification.',
        caseId: caseDocs[3]._id, assignedTo: ATT.delaCruz,
        priority: 'Medium', status: 'Completed', dueDate: d(-10),
        completionPercentage: 100,
      },
      {
        title: 'Analyze Trading Timeline – Whitaker',
        description: 'Map securities trades against material non-public information disclosure dates.',
        caseId: caseDocs[4]._id, assignedTo: ATT.novak,
        priority: 'High', status: 'In Progress', dueDate: d(18),
        completionPercentage: 55,
      },
      {
        title: 'Schedule Medical Expert Deposition',
        description: 'Coordinate deposition of opposing medical expert for malpractice case.',
        caseId: caseDocs[5]._id, assignedTo: ATT.brennan,
        priority: 'Medium', status: 'To Do', dueDate: d(50),
        completionPercentage: 0,
      },
      {
        title: 'Classify Import Records – Quintero',
        description: 'Categorize 3 years of import declarations by HS tariff codes.',
        caseId: caseDocs[6]._id, assignedTo: ATT.garrison,
        priority: 'Medium', status: 'In Progress', dueDate: d(30),
        completionPercentage: 40,
      },
      {
        title: 'Appraise Marital Real Estate',
        description: 'Coordinate independent appraisals of 2 jointly owned properties.',
        caseId: caseDocs[7]._id, assignedTo: ATT.novak,
        priority: 'High', status: 'Completed', dueDate: d(-3),
        completionPercentage: 100,
      },
      {
        title: 'Draft Custody Parenting Plan',
        description: 'Prepare proposed parenting schedule with holiday rotation.',
        caseId: caseDocs[7]._id, assignedTo: ATT.novak,
        priority: 'High', status: 'In Progress', dueDate: d(14),
        completionPercentage: 80,
      },
      {
        title: 'Review Licensing Royalty Calculations',
        description: 'Audit software licensing royalty payments vs. contractual obligations.',
        caseId: caseDocs[8]._id, assignedTo: ATT.delaCruz,
        priority: 'Medium', status: 'To Do', dueDate: d(65),
        completionPercentage: 10,
      },
      {
        title: 'Collect Witness Declarations – Raghavan',
        description: 'Obtain signed declarations from 4 colleague witnesses regarding discrimination.',
        caseId: caseDocs[9]._id, assignedTo: ATT.brennan,
        priority: 'Medium', status: 'In Progress', dueDate: d(35),
        completionPercentage: 50,
      },
      {
        title: 'Negotiate Easement Compensation',
        description: 'Negotiate per-acre compensation rates with three landowners for pipeline easement.',
        caseId: caseDocs[10]._id, assignedTo: ATT.okonkwo,
        priority: 'Low', status: 'To Do', dueDate: d(55),
        completionPercentage: 5,
      },
      {
        title: 'File Motion to Decertify Class',
        description: 'Draft and file motion challenging class certification in wage claim.',
        caseId: caseDocs[11]._id, assignedTo: ATT.novak,
        priority: 'High', status: 'Completed', dueDate: d(-8),
        completionPercentage: 100,
      },
      {
        title: 'Obtain Marine Surveyor Estimates',
        description: 'Coordinate with 2 independent marine surveyors for damage assessment.',
        caseId: caseDocs[12]._id, assignedTo: ATT.garrison,
        priority: 'Medium', status: 'In Progress', dueDate: d(45),
        completionPercentage: 30,
      },
      {
        title: 'Compile Asylum Supporting Evidence',
        description: 'Gather country conditions evidence, news articles, and personal threat documentation.',
        caseId: caseDocs[15]._id, assignedTo: ATT.delaCruz,
        priority: 'High', status: 'In Progress', dueDate: d(42),
        completionPercentage: 65,
      },
      {
        title: 'Prepare Opening Statement – Calloway',
        description: 'Draft opening argument for contested divorce hearing.',
        caseId: caseDocs[7]._id, assignedTo: ATT.novak,
        priority: 'High', status: 'To Do', dueDate: d(16),
        completionPercentage: 0,
      },
      {
        title: 'Respond to SEC Interrogatories',
        description: 'Draft responses to SEC written interrogatories for securities investigation.',
        caseId: caseDocs[4]._id, assignedTo: ATT.novak,
        priority: 'High', status: 'Overdue', dueDate: d(-2),
        completionPercentage: 30,
      },
      {
        title: 'Settlement Demand Letter – Beauregard',
        description: 'Prepare formal demand letter to landlord/management company for eviction damages.',
        caseId: caseDocs[1]._id, assignedTo: ATT.brennan,
        priority: 'Medium', status: 'Overdue', dueDate: d(-7),
        completionPercentage: 15,
      },
      {
        title: 'Financial Disclosure Review – Beauregard',
        description: 'Analyze opposing party financial disclosures for child support modification.',
        caseId: caseDocs[14]._id, assignedTo: ATT.novak,
        priority: 'Medium', status: 'To Do', dueDate: d(28),
        completionPercentage: 0,
      },
    ]);

    // ── 6. Seed Notifications (recent activity log) ───────────────────────────
    await Notification.insertMany([
      {
        type: 'success', title: 'Board resolution approved for Ashford Ventures',
        message: 'Poison pill shareholder rights plan adopted by board unanimously.',
        createdBy: ATT.okonkwo, entity: 'Case', action: 'updated', createdAt: d(-1),
      },
      {
        type: 'info', title: 'New case filed: El-Masri Political Asylum',
        message: 'Asylum petition filed with immigration court. Hearing date set.',
        createdBy: ATT.delaCruz, entity: 'Case', action: 'created', createdAt: d(-2),
      },
      {
        type: 'warning', title: 'SEC interrogatory deadline approaching – Whitaker',
        message: 'Response to SEC interrogatories due in 48 hours.',
        createdBy: 'System', entity: 'Task', action: 'updated', createdAt: d(-2),
      },
      {
        type: 'success', title: 'Class decertification motion filed – Whitaker',
        message: 'Motion to decertify wage claim class action submitted to court.',
        createdBy: ATT.novak, entity: 'Document', action: 'created', createdAt: d(-3),
      },
      {
        type: 'info', title: 'New client onboarded: Nadia El-Masri',
        message: 'New individual client from Boston seeking asylum representation.',
        createdBy: ATT.delaCruz, entity: 'Client', action: 'created', createdAt: d(-4),
      },
      {
        type: 'danger', title: 'Overdue: Settlement demand letter – Beauregard',
        message: 'Settlement demand letter is 7 days past deadline.',
        createdBy: 'System', entity: 'Task', action: 'updated', createdAt: d(-5),
      },
      {
        type: 'success', title: 'PERM recruitment ads completed – Raghavan',
        message: 'All required recruitment advertisements placed per DOL guidelines.',
        createdBy: ATT.delaCruz, entity: 'Task', action: 'updated', createdAt: d(-6),
      },
      {
        type: 'info', title: 'Marital property appraisals received – Calloway',
        message: 'Two independent appraisals completed for jointly owned properties.',
        createdBy: ATT.novak, entity: 'Document', action: 'created', createdAt: d(-7),
      },
      {
        type: 'warning', title: 'EPA response deadline in 30 days – Ostra Energy',
        message: 'Environmental response brief due to EPA within one month.',
        createdBy: 'System', entity: 'Task', action: 'updated', createdAt: d(-8),
      },
      {
        type: 'success', title: 'Workers comp appeal won – Holgersen',
        message: 'Administrative law judge ruled in favor. Benefits reinstated.',
        createdBy: ATT.brennan, entity: 'Case', action: 'updated', createdAt: d(-10),
      },
      {
        type: 'info', title: 'Court date set: Calloway divorce hearing',
        message: `Divorce hearing scheduled for ${d(18).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.`,
        createdBy: ATT.novak, entity: 'Case', action: 'updated', createdAt: d(-12),
      },
      {
        type: 'info', title: 'Document uploaded: Customs manifest analysis',
        message: '36-month customs analysis uploaded for Quintero import case.',
        createdBy: ATT.garrison, entity: 'Document', action: 'created', createdAt: d(-14),
      },
    ]);

    // ── 7. Seed Billing / Invoices (16 invoices) ──────────────────────────────
    await Billing.insertMany([
      {
        invoiceNumber: 'INV-2025-0001',
        caseId: caseDocs[0]._id, clientId: ashford._id,
        attorney: ATT.okonkwo, description: 'Hostile takeover defense – initial retainer & strategy sessions',
        hours: 42, hourlyRate: 500, amount: 21000,
        status: 'Paid', dueDate: d(-60), paidDate: d(-55),
      },
      {
        invoiceNumber: 'INV-2025-0002',
        caseId: caseDocs[0]._id, clientId: ashford._id,
        attorney: ATT.okonkwo, description: 'Takeover defense – board resolution & shareholder communications',
        hours: 38, hourlyRate: 500, amount: 19000,
        status: 'Sent', dueDate: d(10),
      },
      {
        invoiceNumber: 'INV-2025-0003',
        caseId: caseDocs[1]._id, clientId: beauregard._id,
        attorney: ATT.brennan, description: 'Wrongful eviction – complaint drafting & evidence compilation',
        hours: 24, hourlyRate: 275, amount: 6600,
        status: 'Paid', dueDate: d(-45), paidDate: d(-40),
      },
      {
        invoiceNumber: 'INV-2025-0004',
        caseId: caseDocs[2]._id, clientId: ostrovsky._id,
        attorney: ATT.garrison, description: 'EPA compliance audit – environmental report review & response drafting',
        hours: 56, hourlyRate: 475, amount: 26600,
        status: 'Sent', dueDate: d(15),
      },
      {
        invoiceNumber: 'INV-2025-0005',
        caseId: caseDocs[3]._id, clientId: raghavan._id,
        attorney: ATT.delaCruz, description: 'H-1B to Green Card – PERM labor certification filing',
        hours: 18, hourlyRate: 350, amount: 6300,
        status: 'Paid', dueDate: d(-30), paidDate: d(-28),
      },
      {
        invoiceNumber: 'INV-2025-0006',
        caseId: caseDocs[4]._id, clientId: whitaker._id,
        attorney: ATT.novak, description: 'Securities fraud defense – SEC interrogatory preparation',
        hours: 64, hourlyRate: 550, amount: 35200,
        status: 'Overdue', dueDate: d(-15),
      },
      {
        invoiceNumber: 'INV-2025-0007',
        caseId: caseDocs[5]._id, clientId: holgersen._id,
        attorney: ATT.brennan, description: 'Medical malpractice – expert opinion coordination',
        hours: 12, hourlyRate: 275, amount: 3300,
        status: 'Draft', dueDate: d(30),
      },
      {
        invoiceNumber: 'INV-2025-0008',
        caseId: caseDocs[6]._id, clientId: quintero._id,
        attorney: ATT.garrison, description: 'Customs violations – manifest analysis & CBP response preparation',
        hours: 45, hourlyRate: 475, amount: 21375,
        status: 'Sent', dueDate: d(20),
      },
      {
        invoiceNumber: 'INV-2025-0009',
        caseId: caseDocs[7]._id, clientId: calloway._id,
        attorney: ATT.novak, description: 'Divorce proceedings – asset appraisal & custody plan drafting',
        hours: 52, hourlyRate: 400, amount: 20800,
        status: 'Paid', dueDate: d(-20), paidDate: d(-18),
      },
      {
        invoiceNumber: 'INV-2025-0010',
        caseId: caseDocs[9]._id, clientId: raghavan._id,
        attorney: ATT.brennan, description: 'Workplace discrimination – EEOC filing & witness declarations',
        hours: 28, hourlyRate: 350, amount: 9800,
        status: 'Sent', dueDate: d(25),
      },
      {
        invoiceNumber: 'INV-2025-0011',
        caseId: caseDocs[11]._id, clientId: whitaker._id,
        attorney: ATT.novak, description: 'Class action defense – motion to decertify class',
        hours: 72, hourlyRate: 550, amount: 39600,
        status: 'Overdue', dueDate: d(-8),
      },
      {
        invoiceNumber: 'INV-2025-0012',
        caseId: caseDocs[12]._id, clientId: quintero._id,
        attorney: ATT.garrison, description: 'Maritime insurance claim – surveyor coordination & filing',
        hours: 20, hourlyRate: 400, amount: 8000,
        status: 'Draft', dueDate: d(40),
      },
      {
        invoiceNumber: 'INV-2025-0013',
        caseId: caseDocs[14]._id, clientId: beauregard._id,
        attorney: ATT.novak, description: 'Child support modification – financial analysis & petition',
        hours: 15, hourlyRate: 400, amount: 6000,
        status: 'Sent', dueDate: d(18),
      },
      {
        invoiceNumber: 'INV-2025-0014',
        caseId: caseDocs[15]._id, clientId: elmasri._id,
        attorney: ATT.delaCruz, description: 'Political asylum – country conditions research & evidence package',
        hours: 35, hourlyRate: 350, amount: 12250,
        status: 'Draft', dueDate: d(45),
      },
      {
        invoiceNumber: 'INV-2025-0015',
        caseId: caseDocs[16]._id, clientId: ashford._id,
        attorney: ATT.okonkwo, description: 'SEC 10-K annual filing review (closed case)',
        hours: 16, hourlyRate: 500, amount: 8000,
        status: 'Paid', dueDate: d(-200), paidDate: d(-195),
      },
      {
        invoiceNumber: 'INV-2025-0016',
        caseId: caseDocs[17]._id, clientId: holgersen._id,
        attorney: ATT.brennan, description: 'Workers comp appeal – administrative hearing prep (closed)',
        hours: 22, hourlyRate: 275, amount: 6050,
        status: 'Paid', dueDate: d(-35), paidDate: d(-30),
      },
    ]);

    res.json({
      success: true,
      message: '✅ Database seeded with unique Brieflytix demo data!',
      summary: {
        clients: 10,
        cases: 18,
        documents: 18,
        tasks: 20,
        notifications: 12,
        invoices: 16,
      },
    });
  } catch (err) {
    console.error('Seed error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
