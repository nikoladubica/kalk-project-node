const setInvoiceLinesValues = (id, item) => {
    const priceVatDiscount = () => {
        const taxPercent = item['cac:Item'] ? item['cac:Item']['cac:ClassifiedTaxCategory']['cbc:Percent'] : 0;
        const quantity = item['cbc:InvoicedQuantity'];
        const price = item['cac:Price'] ? item['cac:Price']['cbc:PriceAmount'] : 0;
        let taxableAmount = item['cbc:LineExtensionAmount'];

        if (item['cac:TaxTotal']) {
            const taxAmount = item['cac:TaxTotal']['cac:TaxSubtotal']['cbc:TaxAmount'];
            taxableAmount = item['cac:TaxTotal']['cac:TaxSubtotal']['cbc:TaxableAmount'];

            const taxPerItem = taxAmount / quantity;
            const taxablePerItem = taxableAmount / quantity;

            return parseFloat(taxPerItem + taxablePerItem);
        } else {
            const floatPercentage = (100 + taxPercent) / 100;
            const taxPerItem = ((price * floatPercentage) - price);
            const taxablePerItem = taxableAmount / quantity;

            return parseFloat(taxPerItem + taxablePerItem);
        }
    }

    const taxAmount = () => {
        if (item['cac:TaxTotal']) {
            return item['cac:TaxTotal']['cac:TaxSubtotal']['cbc:TaxAmount'];
        } else {
            const taxPercent = item['cac:Item'] ? item['cac:Item']['cac:ClassifiedTaxCategory']['cbc:Percent'] : 0;
            const price = item['cac:Price'] ? item['cac:Price']['cbc:PriceAmount'] : 0;
            const quantity = item['cbc:InvoicedQuantity'];

            const floatPercentage = (100 + taxPercent) / 100;

            return ((price * floatPercentage) - price) * quantity;
        }
    }

    const taxableAmount = () => {
        if (item['cac:TaxTotal']) {
            return item['cac:TaxTotal']['cac:TaxSubtotal']['cbc:TaxableAmount'];
        } else {
            return item['cbc:LineExtensionAmount']
        }
    }

    const multiplierFactorNumeric = () => {
        if (item['cac:AllowanceCharge']) {
            return item['cac:AllowanceCharge']['cac:MultiplierFactorNumeric'];
        } else {
            return 1;
        }
    }

    const allowanceChargeAmount = () => {
        if (item['cac:AllowanceCharge']) {
            return item['cac:AllowanceCharge']['cac:Amount'];
        } else {
            return 0;
        }
    }

    const name = () => {
        if (item['cac:Item']) {
            return item['cac:Item']['cbc:Name'];
        } else {
            return "";
        }
    }

    const taxID = () => {
        if (item['cac:Item']) {
            return item['cac:Item']['cac:ClassifiedTaxCategory']['cbc:ID'];
        } else {
            return "";
        }
    }

    const taxPercent = () => {
        if (item['cac:Item']) {
            return item['cac:Item']['cac:ClassifiedTaxCategory']['cbc:Percent'];
        } else {
            return 0;
        }
    }

    const priceAmount = () => {
        if (item['cac:Price']) {
            return item['cac:Price']['cbc:PriceAmount'];
        } else {
            return 0;
        }
    }

    return {
        purchaseInvoiceId: id,
        quantity: item['cbc:InvoicedQuantity'],
        name: name(),
        taxCategory: taxID(),
        taxPercent: taxPercent(),
        taxTotal: taxAmount(),
        taxableAmount: taxableAmount(),
        priceAmount: priceAmount(),
        discountPercentage: multiplierFactorNumeric(),
        totalDiscount: allowanceChargeAmount(),
        priceVatDiscount: priceVatDiscount()
    }
}

module.exports = {
    setInvoiceLinesValues,
}