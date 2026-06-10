import io
from fpdf import FPDF
from app.db.models import Invoice, Client

class PDF(FPDF):
    def header(self):
        # Arial bold 15
        self.set_font('Arial', 'B', 15)
        # Title
        self.cell(0, 10, 'Factura', 0, 1, 'C')
        self.ln(10)

    def footer(self):
        # Position at 1.5 cm from bottom
        self.set_y(-15)
        # Arial italic 8
        self.set_font('Arial', 'I', 8)
        # Page number
        self.cell(0, 10, f'Page {self.page_no()}/{{nb}}', 0, 0, 'C')

def generate_invoice_pdf(invoice: Invoice, client: Client, tenant_name: str) -> bytes:
    pdf = PDF()
    pdf.alias_nb_pages()
    pdf.add_page()
    
    # Provider Info
    pdf.set_font('Arial', 'B', 12)
    pdf.cell(100, 10, f'Empresa: {tenant_name}', 0, 0, 'L')
    pdf.set_font('Arial', '', 12)
    pdf.cell(90, 10, f'Tipo: Factura {invoice.invoice_type}', 0, 1, 'R')
    pdf.cell(100, 10, f'Fecha: {invoice.issue_date}', 0, 0, 'L')
    if invoice.cae:
        pdf.cell(90, 10, f'CAE: {invoice.cae}', 0, 1, 'R')
    else:
        pdf.ln(10)
    pdf.line(10, pdf.get_y(), 200, pdf.get_y())
    pdf.ln(5)
    
    # Client Info
    pdf.set_font('Arial', 'B', 12)
    pdf.cell(0, 10, 'Cliente:', 0, 1)
    pdf.set_font('Arial', '', 12)
    pdf.cell(0, 10, f'Razon Social: {client.legal_name}', 0, 1)
    pdf.cell(0, 10, f'CUIT/RUT: {client.cuit}', 0, 1)
    if client.address:
        pdf.cell(0, 10, f'Domicilio: {client.address}', 0, 1)
    
    pdf.line(10, pdf.get_y(), 200, pdf.get_y())
    pdf.ln(10)
    
    # Table Header
    pdf.set_font('Arial', 'B', 12)
    pdf.cell(80, 10, 'Descripcion', 1, 0, 'C')
    pdf.cell(30, 10, 'Cant.', 1, 0, 'C')
    pdf.cell(40, 10, 'Precio Unit.', 1, 0, 'C')
    pdf.cell(40, 10, 'Total', 1, 1, 'C')
    
    # Items
    pdf.set_font('Arial', '', 12)
    for item in invoice.items:
        pdf.cell(80, 10, item.description, 1, 0, 'L')
        pdf.cell(30, 10, str(item.quantity), 1, 0, 'C')
        pdf.cell(40, 10, f'${item.unit_price:.2f}', 1, 0, 'R')
        pdf.cell(40, 10, f'${item.total:.2f}', 1, 1, 'R')
        
    pdf.ln(10)
    
    # Totals
    pdf.set_font('Arial', 'B', 12)
    pdf.cell(150, 10, 'Total:', 0, 0, 'R')
    pdf.cell(40, 10, f'${invoice.total_amount:.2f}', 1, 1, 'R')
    
    # Output to byte array
    return bytes(pdf.output(dest='S'))
