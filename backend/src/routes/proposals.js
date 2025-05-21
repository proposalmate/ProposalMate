const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Proposal = require('../models/Proposal');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');

// @desc    Get all proposals for logged in user
// @route   GET /api/v1/proposals
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const proposals = await Proposal.find({ user: req.user.id });
    
    res.status(200).json({
      success: true,
      count: proposals.length,
      data: proposals
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

// @desc    Get single proposal
// @route   GET /api/v1/proposals/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    
    if (!proposal) {
      return res.status(404).json({
        success: false,
        error: 'Proposal not found'
      });
    }
    
    // Make sure user owns proposal
    if (proposal.user.toString() !== req.user.id && proposal.status !== 'shared') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this proposal'
      });
    }
    
    res.status(200).json({
      success: true,
      data: proposal
    });
  } catch (err) {
    console.error(err);
    
    // Handle invalid ObjectId
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Proposal not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

// @desc    Create new proposal
// @route   POST /api/v1/proposals
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    // Add user to request body
    req.body.user = req.user.id;
    
    // Create proposal
    const proposal = await Proposal.create(req.body);
    
    res.status(201).json({
      success: true,
      data: proposal
    });
  } catch (err) {
    console.error(err);
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      
      return res.status(400).json({
        success: false,
        error: messages
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

// @desc    Update proposal
// @route   PUT /api/v1/proposals/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    let proposal = await Proposal.findById(req.params.id);
    
    if (!proposal) {
      return res.status(404).json({
        success: false,
        error: 'Proposal not found'
      });
    }
    
    // Make sure user owns proposal
    if (proposal.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this proposal'
      });
    }
    
    // Update proposal
    proposal = await Proposal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: proposal
    });
  } catch (err) {
    console.error(err);
    
    // Handle invalid ObjectId
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Proposal not found'
      });
    }
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      
      return res.status(400).json({
        success: false,
        error: messages
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

// @desc    Delete proposal
// @route   DELETE /api/v1/proposals/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    
    if (!proposal) {
      return res.status(404).json({
        success: false,
        error: 'Proposal not found'
      });
    }
    
    // Make sure user owns proposal
    if (proposal.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to delete this proposal'
      });
    }
    
    await proposal.remove();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error(err);
    
    // Handle invalid ObjectId
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Proposal not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

// @desc    Generate PDF for proposal
// @route   GET /api/v1/proposals/:id/pdf
// @access  Private
router.get('/:id/pdf', protect, async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    
    if (!proposal) {
      return res.status(404).json({
        success: false,
        error: 'Proposal not found'
      });
    }
    
    // Make sure user owns proposal
    if (proposal.user.toString() !== req.user.id && proposal.status !== 'shared') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this proposal'
      });
    }
    
    // Create PDF document
    const doc = new PDFDocument({
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
      }
    });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=proposal-${proposal._id}.pdf`);
    
    // Pipe PDF to response
    doc.pipe(res);
    
    // Add content to PDF
    generateProposalPDF(doc, proposal);
    
    // Finalize PDF
    doc.end();
  } catch (err) {
    console.error(err);
    
    // Handle invalid ObjectId
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Proposal not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

// @desc    Share proposal via email
// @route   POST /api/v1/proposals/:id/share/email
// @access  Private
router.post('/:id/share/email', protect, async (req, res) => {
  try {
    const { recipientEmail, subject, message } = req.body;
    
    if (!recipientEmail || !subject || !message) {
      return res.status(400).json({
        success: false,
        error: 'Please provide recipient email, subject, and message'
      });
    }
    
    const proposal = await Proposal.findById(req.params.id);
    
    if (!proposal) {
      return res.status(404).json({
        success: false,
        error: 'Proposal not found'
      });
    }
    
    // Make sure user owns proposal
    if (proposal.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to share this proposal'
      });
    }
    
    // Get user info
    const user = await User.findById(req.user.id);
    
    // Generate shareable link
    const shareableLink = `${req.protocol}://${req.get('host')}/pages/view-proposal.html?id=${proposal._id}&share=true`;
    
    // Update proposal status to sent
    proposal.status = 'sent';
    await proposal.save();
    
    // Send email
    await sendProposalEmail(user, proposal, recipientEmail, subject, message, shareableLink);
    
    res.status(200).json({
      success: true,
      data: {
        message: 'Proposal shared successfully'
      }
    });
  } catch (err) {
    console.error(err);
    
    // Handle invalid ObjectId
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Proposal not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

// @desc    Accept proposal
// @route   POST /api/v1/proposals/:id/accept
// @access  Public
router.post('/:id/accept', async (req, res) => {
  try {
    const { clientName, clientEmail, signature } = req.body;
    
    if (!clientName || !clientEmail || !signature) {
      return res.status(400).json({
        success: false,
        error: 'Please provide client name, email, and signature'
      });
    }
    
    const proposal = await Proposal.findById(req.params.id);
    
    if (!proposal) {
      return res.status(404).json({
        success: false,
        error: 'Proposal not found'
      });
    }
    
    // Update proposal status and acceptance details
    proposal.status = 'accepted';
    proposal.acceptedBy = {
      name: clientName,
      email: clientEmail,
      signature: signature,
      date: Date.now()
    };
    
    await proposal.save();
    
    // Get user info
    const user = await User.findById(proposal.user);
    
    // Send acceptance notification email to proposal owner
    await sendAcceptanceEmail(user, proposal, clientName, clientEmail);
    
    res.status(200).json({
      success: true,
      data: {
        message: 'Proposal accepted successfully'
      }
    });
  } catch (err) {
    console.error(err);
    
    // Handle invalid ObjectId
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Proposal not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

// Helper function to generate PDF content
function generateProposalPDF(doc, proposal) {
  // Add logo if available
  // doc.image('path/to/logo.png', 50, 45, { width: 150 });
  
  // Add title
  doc.fontSize(24)
     .font('Helvetica-Bold')
     .text(proposal.title, { align: 'center' })
     .moveDown(1);
  
  // Add client info if available
  if (proposal.clientName || (proposal.client && proposal.client.name)) {
    doc.fontSize(12)
       .font('Helvetica')
       .text(`Prepared for: ${proposal.clientName || proposal.client.name}`, { align: 'left' })
       .moveDown(0.5);
  }
  
  // Add date
  doc.text(`Date: ${new Date(proposal.createdAt).toLocaleDateString()}`, { align: 'left' })
     .moveDown(2);
  
  // Add sections based on template
  if (proposal.template && proposal.template !== 'default') {
    // Add template-specific content
    switch (proposal.template) {
      case 'photography':
        addPhotographyContent(doc, proposal);
        break;
      case 'planning':
        addPlanningContent(doc, proposal);
        break;
      case 'venue':
        addVenueContent(doc, proposal);
        break;
      case 'catering':
        addCateringContent(doc, proposal);
        break;
      default:
        addDefaultContent(doc, proposal);
    }
  } else {
    // Add default content
    addDefaultContent(doc, proposal);
  }
  
  // Add footer
  const pageCount = doc.bufferedPageRange().count;
  for (let i = 0; i < pageCount; i++) {
    doc.switchToPage(i);
    
    // Add page number
    doc.fontSize(8)
       .text(
         `Page ${i + 1} of ${pageCount}`,
         50,
         doc.page.height - 50,
         { align: 'center' }
       );
  }
}

// Helper functions for different template types
function addPhotographyContent(doc, proposal) {
  // Introduction
  doc.fontSize(16)
     .font('Helvetica-Bold')
     .text('Introduction', { underline: true })
     .moveDown(0.5)
     .fontSize(12)
     .font('Helvetica')
     .text('Thank you for considering our photography services for your special day. This proposal outlines our approach, packages, and how we\'ll capture the beautiful moments of your wedding.')
     .moveDown(1);
  
  // Our Style
  doc.fontSize(16)
     .font('Helvetica-Bold')
     .text('Our Style', { underline: true })
     .moveDown(0.5)
     .fontSize(12)
     .font('Helvetica')
     .text('We specialize in a blend of documentary and fine art photography, focusing on authentic moments while creating timeless, elegant portraits.')
     .moveDown(1);
  
  // Packages
  doc.fontSize(16)
     .font('Helvetica-Bold')
     .text('Packages', { underline: true })
     .moveDown(0.5);
  
  // Essential Package
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .text('Essential Package')
     .moveDown(0.2)
     .fontSize(12)
     .font('Helvetica-Bold')
     .text('£1,200')
     .moveDown(0.2)
     .font('Helvetica')
     .list([
       '6 hours of coverage',
       '1 photographer',
       'Online gallery with 300+ edited images',
       'Print release'
     ], { bulletRadius: 2, textIndent: 20 })
     .moveDown(1);
  
  // Classic Package
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .text('Classic Package')
     .moveDown(0.2)
     .fontSize(12)
     .font('Helvetica-Bold')
     .text('£1,800')
     .moveDown(0.2)
     .font('Helvetica')
     .list([
       '8 hours of coverage',
       '2 photographers',
       'Engagement session',
       'Online gallery with 500+ edited images',
       'Print release',
       'USB with high-resolution images'
     ], { bulletRadius: 2, textIndent: 20 })
     .moveDown(1);
  
  // Premium Package
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .text('Premium Package')
     .moveDown(0.2)
     .fontSize(12)
     .font('Helvetica-Bold')
     .text('£2,500')
     .moveDown(0.2)
     .font('Helvetica')
     .list([
       '10 hours of coverage',
       '2 photographers',
       'Engagement session',
       'Bridal session',
       'Online gallery with 700+ edited images',
       'Print release',
       'USB with high-resolution images',
       '20-page wedding album'
     ], { bulletRadius: 2, textIndent: 20 })
     .moveDown(1);
  
  // Process
  doc.fontSize(16)
     .font('Helvetica-Bold')
     .text('Process', { underline: true })
     .moveDown(0.5)
     .fontSize(12)
     .font('Helvetica')
     .list([
       'Initial consultation',
       'Booking and contract',
       'Pre-wedding planning',
       'Wedding day coverage',
       'Image editing (4-6 weeks)',
       'Image delivery',
       'Album design (if applicable)'
     ], { numbered: true, textIndent: 20 })
     .moveDown(1);
  
  // Add custom content if available
  if (proposal.content && typeof proposal.content === 'string') {
    doc.addPage()
       .fontSize(16)
       .font('Helvetica-Bold')
       .text('Additional Information', { underline: true })
       .moveDown(0.5)
       .fontSize(12)
       .font('Helvetica')
       .text(proposal.content)
       .moveDown(1);
  }
}

function addPlanningContent(doc, proposal) {
  // Introduction
  doc.fontSize(16)
     .font('Helvetica-Bold')
     .text('Introduction', { underline: true })
     .moveDown(0.5)
     .fontSize(12)
     .font('Helvetica')
     .text('Thank you for considering our wedding planning services. This proposal outlines how we can help make your wedding day perfect, stress-free, and memorable.')
     .moveDown(1);
  
  // Our Approach
  doc.fontSize(16)
     .font('Helvetica-Bold')
     .text('Our Approach', { underline: true })
     .moveDown(0.5)
     .fontSize(12)
     .font('Helvetica')
     .text('We believe in creating personalized, meaningful celebrations that reflect your unique love story and vision. Our approach combines creativity, meticulous organization, and flawless execution.')
     .moveDown(1);
  
  // Services
  doc.fontSize(16)
     .font('Helvetica-Bold')
     .text('Services', { underline: true })
     .moveDown(0.5);
  
  // Month-of Coordination
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .text('Month-of Coordination')
     .moveDown(0.2)
     .fontSize(12)
     .font('Helvetica-Bold')
     .text('£800')
     .moveDown(0.2)
     .font('Helvetica')
     .list([
       '3 planning meetings',
       'Vendor coordination',
       'Timeline creation',
       'Rehearsal direction',
       'Full wedding day coordination (10 hours)'
     ], { bulletRadius: 2, textIndent: 20 })
     .moveDown(1);
  
  // Partial Planning
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .text('Partial Planning')
     .moveDown(0.2)
     .fontSize(12)
     .font('Helvetica-Bold')
     .text('£1,500')
     .moveDown(0.2)
     .font('Helvetica')
     .list([
       '6 planning meetings',
       'Vendor recommendations and coordination',
       'Budget management',
       'Timeline creation',
       'Rehearsal direction',
       'Full wedding day coordination (12 hours)'
     ], { bulletRadius: 2, textIndent: 20 })
     .moveDown(1);
  
  // Full Planning
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .text('Full Planning')
     .moveDown(0.2)
     .fontSize(12)
     .font('Helvetica-Bold')
     .text('£3,000')
     .moveDown(0.2)
     .font('Helvetica')
     .list([
       'Unlimited planning meetings',
       'Venue selection',
       'Complete vendor management',
       'Design and styling',
       'Budget management',
       'Timeline creation',
       'Rehearsal direction',
       'Full wedding day coordination (14 hours)'
     ], { bulletRadius: 2, textIndent: 20 })
     .moveDown(1);
  
  // Planning Process
  doc.addPage()
     .fontSize(16)
     .font('Helvetica-Bold')
     .text('Planning Process', { underline: true })
     .moveDown(0.5)
     .fontSize(12)
     .font('Helvetica')
     .list([
       'Initial consultation',
       'Vision and concept development',
       'Budget planning',
       'Vendor selection',
       'Design and styling',
       'Logistics and timeline',
       'Final details',
       'Rehearsal',
       'Wedding day execution'
     ], { numbered: true, textIndent: 20 })
     .moveDown(1);
  
  // Add custom content if available
  if (proposal.content && typeof proposal.content === 'string') {
    doc.addPage()
       .fontSize(16)
       .font('Helvetica-Bold')
       .text('Additional Information', { underline: true })
       .moveDown(0.5)
       .fontSize(12)
       .font('Helvetica')
       .text(proposal.content)
       .moveDown(1);
  }
}

function addVenueContent(doc, proposal) {
  // Introduction
  doc.fontSize(16)
     .font('Helvetica-Bold')
     .text('Introduction', { underline: true })
     .moveDown(0.5)
     .fontSize(12)
     .font('Helvetica')
     .text('Thank you for considering our venue for your wedding celebration. This proposal outlines our spaces, packages, and how we can create the perfect setting for your special day.')
     .moveDown(1);
  
  // Our Venue
  doc.fontSize(16)
     .font('Helvetica-Bold')
     .text('Our Venue', { underline: true })
     .moveDown(0.5)
     .fontSize(12)
     .font('Helvetica')
     .text('Our historic venue offers a blend of timeless elegance and modern amenities, set in 5 acres of landscaped gardens with stunning views and photo opportunities.')
     .moveDown(1);
  
  // Spaces
  doc.fontSize(16)
     .font('Helvetica-Bold')
     .text('Spaces', { underline: true })
     .moveDown(0.5);
  
  // Grand Ballroom
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .text('Grand Ballroom')
     .moveDown(0.2)
     .fontSize(12)
     .font('Helvetica-Bold')
     .text('Up to 200 guests')
     .moveDown(0.2)
     .font('Helvetica')
     .text('Our largest space featuring crystal chandeliers, hardwood floors, and floor-to-ceiling windows overlooking the gardens.')
     .moveDown(1);
  
  // Garden Terrace
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .text('Garden Terrace')
     .moveDown(0.2)
     .fontSize(12)
     .font('Helvetica-Bold')
     .text('Up to 150 guests')
     .moveDown(0.2)
     .font('Helvetica')
     .text('A beautiful outdoor space with a permanent marquee, perfect for ceremonies or receptions in spring and summer.')
     .moveDown(1);
  
  // Intimate Library
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .text('Intimate Library')
     .moveDown(0.2)
     .fontSize(12)
     .font('Helvetica-Bold')
     .text('Up to 60 guests')
     .moveDown(0.2)
     .font('Helvetica')
     .text('A charming room with original features, ideal for smaller weddings or as a reception drinks area.')
     .moveDown(1);
  
  // Packages
  doc.addPage()
     .fontSize(16)
     .font('Helvetica-Bold')
     .text('Packages', { underline: true })
     .moveDown(0.5);
  
  // Essential Package
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .text('Essential Package')
     .moveDown(0.2)
     .fontSize(12)
     .font('Helvetica-Bold')
     .text('£3,500')
     .moveDown(0.2)
     .font('Helvetica')
     .list([
       'Venue hire for ceremony and reception (8 hours)',
       'Basic setup and cleanup',
       'Tables and chairs',
       'Parking for guests',
       'Bridal suite access'
     ], { bulletRadius: 2, textIndent: 20 })
     .moveDown(1);
  
  // Classic Package
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .text('Classic Package')
     .moveDown(0.2)
     .fontSize(12)
     .font('Helvetica-Bold')
     .text('£5,500')
     .moveDown(0.2)
     .font('Helvetica')
     .list([
       'Venue hire for ceremony and reception (10 hours)',
       'Setup and cleanup',
       'Tables, chairs, and linens',
       'Basic lighting package',
       'Parking for guests',
       'Bridal suite access',
       'Dedicated venue coordinator'
     ], { bulletRadius: 2, textIndent: 20 })
     .moveDown(1);
  
  // Premium Package
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .text('Premium Package')
     .moveDown(0.2)
     .fontSize(12)
     .font('Helvetica-Bold')
     .text('£7,500')
     .moveDown(0.2)
     .font('Helvetica')
     .list([
       'Exclusive venue hire for entire day',
       'Setup and cleanup',
       'Premium tables, chairs, and linens',
       'Enhanced lighting package',
       'Parking for guests',
       'Bridal suite access',
       'Dedicated venue coordinator',
       'Champagne welcome reception',
       'Menu tasting for up to 4 people'
     ], { bulletRadius: 2, textIndent: 20 })
     .moveDown(1);
  
  // Add custom content if available
  if (proposal.content && typeof proposal.content === 'string') {
    doc.addPage()
       .fontSize(16)
       .font('Helvetica-Bold')
       .text('Additional Information', { underline: true })
       .moveDown(0.5)
       .fontSize(12)
       .font('Helvetica')
       .text(proposal.content)
       .moveDown(1);
  }
}

function addCateringContent(doc, proposal) {
  // Introduction
  doc.fontSize(16)
     .font('Helvetica-Bold')
     .text('Introduction', { underline: true })
     .moveDown(0.5)
     .fontSize(12)
     .font('Helvetica')
     .text('Thank you for considering our catering services for your wedding celebration. This proposal outlines our approach to wedding catering, menu options, and how we\'ll create a memorable dining experience for you and your guests.')
     .moveDown(1);
  
  // Our Approach
  doc.fontSize(16)
     .font('Helvetica-Bold')
     .text('Our Approach', { underline: true })
     .moveDown(0.5)
     .fontSize(12)
     .font('Helvetica')
     .text('We believe food is a central part of any celebration. Our team creates seasonal, locally-sourced menus that can be customized to reflect your tastes, cultural traditions, and dietary requirements.')
     .moveDown(1);
  
  // Service Styles
  doc.fontSize(16)
     .font('Helvetica-Bold')
     .text('Service Styles', { underline: true })
     .moveDown(0.5);
  
  // Plated Service
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .text('Plated Service')
     .moveDown(0.2)
     .fontSize(12)
     .font('Helvetica')
     .text('Elegant, formal dining experience with individually plated courses served to seated guests.')
     .moveDown(0.5);
  
  // Family Style
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .text('Family Style')
     .moveDown(0.2)
     .fontSize(12)
     .font('Helvetica')
     .text('Communal dining experience with large platters of food placed at each table for guests to share.')
     .moveDown(0.5);
  
  // Buffet
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .text('Buffet')
     .moveDown(0.2)
     .fontSize(12)
     .font('Helvetica')
     .text('Casual, flexible dining experience with food stations where guests serve themselves.')
     .moveDown(0.5);
  
  // Food Stations
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .text('Food Stations')
     .moveDown(0.2)
     .fontSize(12)
     .font('Helvetica')
     .text('Interactive experience with themed food stations around the venue, allowing guests to mingle and sample various cuisines.')
     .moveDown(1);
  
  // Sample Menus
  doc.addPage()
     .fontSize(16)
     .font('Helvetica-Bold')
     .text('Sample Menus', { underline: true })
     .moveDown(0.5);
  
  // Classic Menu
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .text('Classic Menu')
     .moveDown(0.2)
     .fontSize(12)
     .font('Helvetica-Bold')
     .text('£55 per person')
     .moveDown(0.2)
     .font('Helvetica')
     .list([
       'Starter: Garden salad with seasonal vegetables and house vinaigrette',
       'Main: Herb-roasted chicken with garlic mashed potatoes and seasonal vegetables',
       'Dessert: Classic vanilla cheesecake with berry compote'
     ], { bulletRadius: 2, textIndent: 20 })
     .moveDown(1);
  
  // Premium Menu
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .text('Premium Menu')
     .moveDown(0.2)
     .fontSize(12)
     .font('Helvetica-Bold')
     .text('£75 per person')
     .moveDown(0.2)
     .font('Helvetica')
     .list([
       'Starter: Seared scallops with pea puree and crispy pancetta',
       'Main: Filet mignon with truffle butter, roasted potatoes, and asparagus',
       'Dessert: Chocolate fondant with vanilla ice cream and salted caramel sauce'
     ], { bulletRadius: 2, textIndent: 20 })
     .moveDown(1);
  
  // Vegetarian Menu
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .text('Vegetarian Menu')
     .moveDown(0.2)
     .fontSize(12)
     .font('Helvetica-Bold')
     .text('£55 per person')
     .moveDown(0.2)
     .font('Helvetica')
     .list([
       'Starter: Roasted beetroot and goat cheese salad with candied walnuts',
       'Main: Wild mushroom risotto with truffle oil and parmesan crisp',
       'Dessert: Lemon tart with raspberry sorbet'
     ], { bulletRadius: 2, textIndent: 20 })
     .moveDown(1);
  
  // Add custom content if available
  if (proposal.content && typeof proposal.content === 'string') {
    doc.addPage()
       .fontSize(16)
       .font('Helvetica-Bold')
       .text('Additional Information', { underline: true })
       .moveDown(0.5)
       .fontSize(12)
       .font('Helvetica')
       .text(proposal.content)
       .moveDown(1);
  }
}

function addDefaultContent(doc, proposal) {
  // Add basic content
  if (proposal.content && typeof proposal.content === 'string') {
    doc.fontSize(12)
       .font('Helvetica')
       .text(proposal.content)
       .moveDown(2);
  }
  
  // Add project details if available
  if (proposal.projectDetails && proposal.projectDetails.description) {
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .text('Project Details', { underline: true })
       .moveDown(0.5)
       .fontSize(12)
       .font('Helvetica')
       .text(proposal.projectDetails.description)
       .moveDown(2);
  }
  
  // Add pricing if available
  if (proposal.pricing && proposal.pricing.total) {
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .text('Pricing', { underline: true })
       .moveDown(0.5)
       .fontSize(12)
       .font('Helvetica')
       .text(`Total: ${proposal.pricing.currency || '£'}${proposal.pricing.total}`)
       .moveDown(0.5);
    
    if (proposal.pricing.paymentTerms) {
      doc.text(`Payment Terms: ${proposal.pricing.paymentTerms}`)
         .moveDown(2);
    }
  }
}

// Helper function to send proposal email
async function sendProposalEmail(user, proposal, recipientEmail, subject, message, shareableLink) {
  // Create nodemailer transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  
  // Email content
  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #d4a373;">${subject}</h2>
      <p>${message}</p>
      <p>You can view the proposal by clicking the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${shareableLink}" style="background-color: #d4a373; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">View Proposal</a>
      </div>
      <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
      <p><a href="${shareableLink}">${shareableLink}</a></p>
      <hr style="border: 1px solid #f0f0f0; margin: 30px 0;" />
      <p style="color: #666; font-size: 12px;">This proposal was sent using ProposalMate.</p>
    </div>
  `;
  
  // Send email
  await transporter.sendMail({
    from: `"${user.name}" <${process.env.EMAIL_FROM}>`,
    to: recipientEmail,
    subject: subject,
    html: emailContent
  });
}

// Helper function to send acceptance email
async function sendAcceptanceEmail(user, proposal, clientName, clientEmail) {
  // Create nodemailer transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  
  // Email content
  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #d4a373;">Proposal Accepted!</h2>
      <p>Great news! Your proposal "${proposal.title}" has been accepted by ${clientName} (${clientEmail}).</p>
      <p>You can view the accepted proposal by clicking the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.CLIENT_URL}/pages/view-proposal.html?id=${proposal._id}" style="background-color: #d4a373; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">View Accepted Proposal</a>
      </div>
      <hr style="border: 1px solid #f0f0f0; margin: 30px 0;" />
      <p style="color: #666; font-size: 12px;">This notification was sent by ProposalMate.</p>
    </div>
  `;
  
  // Send email
  await transporter.sendMail({
    from: `"ProposalMate" <${process.env.EMAIL_FROM}>`,
    to: user.email,
    subject: `Proposal Accepted: ${proposal.title}`,
    html: emailContent
  });
}

module.exports = router;
