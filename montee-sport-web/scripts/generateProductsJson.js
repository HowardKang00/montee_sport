"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// scripts/generateProductsJson.ts
var fs = require("fs");
var path = require("path");
// Root images folder (relative to project root)
var imagesRoot = path.resolve(__dirname, "../images");
// Default sizes
var defaultSizes = ["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"];
// Load all products
function scanProducts() {
    var genders = fs.readdirSync(imagesRoot);
    var products = [];
    for (var _i = 0, genders_1 = genders; _i < genders_1.length; _i++) {
        var gender = genders_1[_i];
        var genderPath = path.join(imagesRoot, gender);
        if (!fs.statSync(genderPath).isDirectory())
            continue;
        var categories = fs.readdirSync(genderPath);
        for (var _a = 0, categories_1 = categories; _a < categories_1.length; _a++) {
            var category = categories_1[_a];
            var categoryPath = path.join(genderPath, category);
            if (!fs.statSync(categoryPath).isDirectory())
                continue;
            var seriesList = fs.readdirSync(categoryPath);
            for (var _b = 0, seriesList_1 = seriesList; _b < seriesList_1.length; _b++) {
                var series = seriesList_1[_b];
                var seriesPath = path.join(categoryPath, series);
                if (!fs.statSync(seriesPath).isDirectory())
                    continue;
                var colorways = fs.readdirSync(seriesPath);
                var _loop_1 = function (colorway) {
                    var colorwayPath = path.join(seriesPath, colorway);
                    if (!fs.statSync(colorwayPath).isDirectory())
                        return "continue";
                    var productPath = path.join(colorwayPath, "product");
                    if (!fs.existsSync(productPath))
                        return "continue";
                    // Collect product images
                    var imgs = fs
                        .readdirSync(productPath)
                        .filter(function (f) { return /\.(jpg|jpeg|png)$/i.test(f); })
                        .map(function (f) { return path.relative(imagesRoot, path.join(productPath, f)); });
                    // Size charts
                    var sizeCharts = [];
                    var sizeChartPath = path.join(categoryPath, "sizechart.jpg");
                    if (fs.existsSync(sizeChartPath)) {
                        sizeCharts.push(path.relative(imagesRoot, sizeChartPath));
                    }
                    var product = {
                        id: "".concat(gender, "-").concat(category, "-").concat(series, "-").concat(colorway),
                        name: "".concat(series, " ").concat(colorway).replace(/_/g, " "),
                        gender: gender,
                        category: category,
                        series: series,
                        colorway: colorway,
                        price: 100,
                        images: imgs.sort(),
                        sizeCharts: sizeCharts,
                        sizes: defaultSizes,
                    };
                    products.push(product);
                };
                for (var _c = 0, colorways_1 = colorways; _c < colorways_1.length; _c++) {
                    var colorway = colorways_1[_c];
                    _loop_1(colorway);
                }
            }
        }
    }
    return products;
}
// Run
var products = scanProducts();
var outPath = path.resolve(__dirname, "../src/data/products.json");
fs.writeFileSync(outPath, JSON.stringify(products, null, 2));
console.log("\u2705 Generated ".concat(products.length, " products -> ").concat(outPath));
