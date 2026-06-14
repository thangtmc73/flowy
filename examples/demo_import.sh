#!/bin/bash
# Demo: Import partner FAQ from text/DOCX/PDF

echo "=========================================="
echo "Demo: Import Partner FAQ"
echo "=========================================="
echo ""

# Check if example file exists
if [ ! -f "examples/faq_example.txt" ]; then
    echo "Error: examples/faq_example.txt not found"
    exit 1
fi

echo "Step 1: Install dependencies (if needed)"
echo "----------------------------------------"
pip list | grep -q "python-docx" || echo "⚠ python-docx not installed. Run: pip install python-docx"
pip list | grep -q "PyPDF2" || echo "⚠ PyPDF2 not installed. Run: pip install PyPDF2"
echo ""

echo "Step 2: Import example FAQ"
echo "----------------------------------------"
echo "Command:"
echo "  python scripts/import_partner_docs.py \\"
echo "    --file examples/faq_example.txt \\"
echo "    --partner-id pvi \\"
echo "    --partner-name 'PVI Insurance' \\"
echo "    --product-id health_care \\"
echo "    --product-name 'PVI Care'"
echo ""

# Note: Script expects .pdf or .docx, so we need to copy to .txt → .docx format
# For demo purposes, user can try with their real DOCX/PDF files

echo "To test with YOUR files:"
echo "  python scripts/import_partner_docs.py \\"
echo "    --file /path/to/your/faq.docx \\"
echo "    --partner-id partner_id \\"
echo "    --partner-name 'Partner Name' \\"
echo "    --product-id product_id \\"
echo "    --product-name 'Product Name' \\"
echo "    --use-llm"
echo ""

echo "=========================================="
echo "For detailed guide, see:"
echo "  docs/IMPORT_FROM_DOCS.md"
echo "=========================================="
