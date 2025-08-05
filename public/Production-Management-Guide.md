# TOTHAI Production Management System - User Guide

## Table of Contents
1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Production Batches](#production-batches)
4. [Product Management](#product-management)
5. [Label Printing & QR Codes](#label-printing--qr-codes)
6. [Dispatch & Picking](#dispatch--picking)
7. [Cleaning Tasks](#cleaning-tasks)
8. [Settings & Administration](#settings--administration)
9. [Reports & Analytics](#reports--analytics)
10. [Troubleshooting](#troubleshooting)

---

## Overview

The TOTHAI Production Management System is a comprehensive solution for managing food production operations. It covers the entire production workflow from ingredient management to final product dispatch, including quality control, traceability, and compliance with food safety standards (FAVV).

### Key Features
- **Production Batch Management**: Track and manage production runs
- **Product Catalog**: Manage ingredients, semi-finished products, dishes, and drinks
- **QR Code Labeling**: Automatic label generation with QR codes for traceability
- **Dispatch System**: Manage picking and distribution of products
- **Cleaning & Hygiene**: Schedule and track cleaning tasks for FAVV compliance
- **Multi-location Support**: Manage operations across TOTHAI and KHIN locations

---

## Getting Started

### System Access
1. Navigate to the production management system
2. Enter the **Manager Passcode** when prompted (default: 9999)
3. Select your current location (TOTHAI or KHIN)

### Main Navigation
- **Dashboard**: Overview of operations, alerts, and quick actions
- **Production**: Create and manage production batches
- **Dispatch**: Pick and send products
- **Cleaning**: Manage hygiene and cleaning tasks
- **Recipe Management**: Manage products, ingredients, and recipes
- **Reports**: View analytics and generate reports
- **Settings**: Configure system parameters

---

## Production Batches

### Creating a New Production Batch

1. **Go to Production Tab**
2. **Click "NEW PRODUCTION" or use the embedded form**
3. **Fill in Required Information:**
   - **Product**: Select from your product catalog
   - **Chef**: Choose the responsible chef
   - **Number of Packages**: Select 1-15 packages from dropdown
   - **Expiry Date**: Auto-calculated based on product shelf life
   - **Production Notes**: Optional additional information

4. **Click "CREATE BATCH AND PRINT LABELS"**

### Batch Information Includes:
- **Batch Number**: Auto-generated (e.g., CUR-20250105-001)
- **Production Date**: Current date
- **Expiry Date**: Based on product shelf life
- **Location**: Current production location
- **Traceability**: Full ingredient and process tracking

### Label Printing
- **Automatic Generation**: Labels are created immediately after batch creation
- **QR Codes**: Each label contains a unique QR code with batch information
- **Label Format**: 102mm x 59mm thermal labels
- **Content Includes**:
  - Product name (English and Thai if available)
  - Batch number
  - Chef name
  - Production and expiry dates
  - Package size
  - QR code for scanning

---

## Product Management

### Product Types

#### 1. Self-Made Products (Zelfgemaakt)
- Products made in-house
- Require recipe definition with ingredients
- Have shelf life specifications
- Include labor time calculations

#### 2. External Products (Extern)
- Purchased finished products
- Require supplier information
- Include cost and pricing data

#### 3. Ingredients (Ingrediënt)
- Raw materials for production
- Include allergen information
- Supplier and cost tracking

#### 4. Drinks
- Beverage products
- Special handling for liquid measurements

#### 5. Semi-Finished Products
- Intermediate products used in recipes
- Require batch size and unit calculations
- Include recipe ingredients

### Adding New Products

1. **Go to Settings → Products**
2. **Click "Add New Product"**
3. **Fill in Product Information:**
   - **Name (English)**: Primary product name
   - **Name (Thai)**: Optional Thai translation
   - **Unit Type**: Liter, Kilogram, Pieces, etc.
   - **Unit Size**: Numerical size per unit
   - **Packages per Batch**: Standard batch quantity
   - **Type**: Select product category
   - **Supplier**: For external products
   - **Shelf Life**: For self-made products (days)
   - **Pricing Information**: Cost, markup, sales price

### Recipe Management

#### For Dishes and Semi-Finished Products:
1. **Select Ingredients**: Choose from available ingredients/semi-finished
2. **Specify Quantities**: Enter amounts needed
3. **Cost Calculation**: System automatically calculates costs
4. **Allergen Tracking**: Automatically inherits from ingredients

---

## Label Printing & QR Codes

### Label Creation Process
1. **Automatic Generation**: Labels created when batch is produced
2. **Preview Available**: Check label before printing
3. **Batch Printing**: Print multiple labels at once
4. **QR Code Content**:
   ```json
   {
     "batch_id": "uuid",
     "batch_number": "CUR-20250105-001",
     "product": "Curry Base",
     "production_date": "05/01/2025",
     "expiry_date": "12/01/2025",
     "package_number": 1,
     "chef": "Chef Name",
     "location": "tothai",
     "package_size": "1 liter",
     "product_id": "uuid"
   }
   ```

### Label Specifications
- **Dimensions**: 102mm x 59mm
- **Format**: Black and white thermal printing
- **QR Code**: 42mm x 42mm scannable code
- **Expiry Highlight**: Bold black border for expiry information
- **Content Layout**:
  - Header: Product name (English/Thai)
  - Body: Batch details, chef, dates, size
  - QR Code: Right side for scanning
  - Footer: Label numbering and company info

---

## Dispatch & Picking

### Overview
The dispatch system manages the picking and distribution of products from inventory to customers or other locations.

### QR Code Scanning for Picking
1. **Go to Dispatch Tab**
2. **Click "Scan QR Code"** button in the inventory section
3. **Scan Product Labels**: Use camera or manual input
4. **Automatic Addition**: Products are automatically added to dispatch list
5. **Quantity Management**: Adjust quantities as needed

### Manual Product Selection
1. **Browse Available Inventory**
2. **Filter by Type**: Self-produced or External products
3. **Add to Dispatch**: Use + buttons or "Add" buttons
4. **View Selected Items**: Summary shows total packages and items

### Dispatch Types
- **Customer Orders**: Direct to customer
- **Internal Transfer**: Between locations
- **Distribution**: To retail locations

### Creating Dispatch Records
1. **Select Products**: Either by QR scanning or manual selection
2. **Choose Dispatch Type**: Customer, Internal, or Distribution
3. **Enter Details**:
   - Customer information (if applicable)
   - Picker code and name
   - Special notes
4. **Generate Packing Slip**: Complete with all product details
5. **Record Dispatch**: Saves to system for tracking

---

## Cleaning Tasks

### FAVV Compliance
The system helps maintain compliance with Belgian Food Agency (FAVV) requirements through systematic cleaning task management.

### Task Types
- **Daily Tasks**: Regular cleaning operations
- **Weekly Tasks**: Deep cleaning procedures
- **Monthly Tasks**: Comprehensive facility maintenance
- **Quarterly Tasks**: Equipment and system overhauls

### Creating Cleaning Tasks
1. **Go to Cleaning Tab**
2. **Click "New Task"**
3. **Fill in Task Details**:
   - **Title**: Clear task description
   - **Location**: TOTHAI or KHIN
   - **Frequency**: Daily, Weekly, Monthly, Quarterly
   - **Assigned Role**: Staff responsible
   - **Estimated Duration**: Time required
   - **FAVV Compliance**: Mark if required for compliance

### Task Management
- **Scheduling**: Automatic task generation based on frequency
- **Assignment**: Assign to specific staff members
- **Photo Documentation**: Required for compliance tasks
- **Completion Tracking**: Mark tasks as completed with notes
- **Overdue Alerts**: System highlights overdue tasks

### Photo Requirements
- **Before/After Photos**: Document cleaning results
- **Equipment Status**: Show equipment condition
- **Compliance Evidence**: Proof of proper procedures
- **Upload Process**: Use camera or file upload

---

## Settings & Administration

### Manager Access
- **Passcode Protection**: Secure access to settings (default: 9999)
- **Change Passcode**: Update security codes as needed
- **Location Management**: Switch between TOTHAI and KHIN

### Staff Management
1. **Staff Codes**: Create unique codes for each staff member
2. **Roles and Permissions**: Assign appropriate access levels
3. **Chef Management**: Manage production staff
4. **Cleaning Staff**: Assign cleaning responsibilities

### Supplier Management
1. **Add Suppliers**: Maintain supplier database
2. **Contact Information**: Store supplier details
3. **Product Associations**: Link products to suppliers
4. **Performance Tracking**: Monitor supplier performance

### Customer Management
1. **Customer Database**: Maintain customer information
2. **Customer Types**: Categorize different customer segments
3. **Delivery Instructions**: Store special delivery requirements
4. **Order History**: Track customer orders

### System Configuration
- **Unit Options**: Configure measurement units
- **Labor Costs**: Set hourly rates for cost calculations
- **Default Values**: Set system defaults
- **Audit Trail**: Track all system changes

---

## Reports & Analytics

### Production Reports
- **Batch History**: Complete production tracking
- **Product Performance**: Most/least produced items
- **Chef Performance**: Production by chef
- **Quality Metrics**: Track defects and issues

### Inventory Reports
- **Stock Levels**: Current inventory status
- **Expiry Tracking**: Items approaching expiration
- **Movement History**: Track product movements
- **Cost Analysis**: Production costs and margins

### FAVV Compliance Reports
- **Cleaning Task Completion**: Compliance tracking
- **Photo Documentation**: Evidence collection
- **Audit Trails**: Complete activity logs
- **Batch Traceability**: Full product traceability

### Dispatch Reports
- **Customer Orders**: Order fulfillment tracking
- **Picker Performance**: Efficiency metrics
- **Product Movement**: Distribution patterns
- **Delivery Status**: Delivery confirmation

### Export Functions
- **CSV Export**: Data export for external analysis
- **PDF Reports**: Formatted report generation
- **Print Functions**: Direct printing capabilities
- **Email Reports**: Automated report distribution

---

## Troubleshooting

### Common Issues

#### Labels Not Printing
- **Check Printer Connection**: Ensure thermal printer is connected
- **Label Size**: Verify 102mm x 59mm thermal labels are loaded
- **Browser Permissions**: Allow printing permissions
- **Print Preview**: Use preview to check layout before printing

#### QR Codes Not Scanning
- **Camera Permissions**: Enable camera access in browser
- **Lighting**: Ensure adequate lighting for scanning
- **Manual Entry**: Use manual input as backup
- **Code Validation**: Check QR code data format

#### Data Not Saving
- **Internet Connection**: Verify stable internet connection
- **Required Fields**: Ensure all required fields are completed
- **Permissions**: Check manager access and passwords
- **Refresh Page**: Try refreshing the browser

#### Missing Products/Data
- **Location Filter**: Check if viewing correct location (TOTHAI/KHIN)
- **Active Status**: Verify products are marked as active
- **Permissions**: Ensure proper access rights
- **Database Sync**: Check for synchronization issues

### System Requirements
- **Browser**: Modern web browser (Chrome, Firefox, Safari, Edge)
- **Internet**: Stable internet connection required
- **Printer**: Thermal label printer for 102mm x 59mm labels
- **Camera**: Device camera for QR code scanning
- **Resolution**: Minimum 1024x768 screen resolution

### Support Contacts
- **Technical Issues**: Contact system administrator
- **Process Questions**: Consult production manager
- **FAVV Compliance**: Contact food safety officer
- **Training Needs**: Schedule additional user training

---

## Best Practices

### Production Management
1. **Daily Batch Review**: Review all production batches daily
2. **Expiry Monitoring**: Check expiring products regularly
3. **Quality Control**: Document any quality issues
4. **Staff Training**: Ensure all staff understand procedures

### Label Management
1. **Print Immediately**: Print labels immediately after batch creation
2. **Quality Check**: Verify QR codes scan properly
3. **Storage**: Store labels properly to prevent damage
4. **Backup Printing**: Keep spare label stock available

### Cleaning Compliance
1. **Photo Documentation**: Always take required photos
2. **Complete Tasks**: Mark tasks complete immediately after finishing
3. **Note Details**: Add specific notes about cleaning procedures
4. **Schedule Adherence**: Follow cleaning schedules strictly

### Data Management
1. **Regular Backups**: Ensure data is backed up regularly
2. **Accurate Entry**: Double-check all data entry
3. **Timely Updates**: Update information promptly
4. **Access Control**: Maintain proper access controls

---

*This guide covers the essential functions of the TOTHAI Production Management System. For additional support or advanced features, consult your system administrator or contact technical support.*

**Version**: 1.0  
**Last Updated**: January 2025  
**Document Type**: User Guide - Production Management System