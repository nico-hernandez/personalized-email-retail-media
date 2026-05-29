<script runat="server">
  Platform.Load("Core", "1.1.1");

  // CONFIG
  var SOURCE_DE = "ProductListRetailMediaExternalKey";
  var TARGET_DE = "ProductDetailRetailMedia";

  // 1. Obtener productos desde DE origen
  function getProductIds() {
    var de = DataExtension.Init(SOURCE_DE);
    var rows = de.Rows.Retrieve();
    var ids = [];
    for (var i = 0; i < rows.length; i++) {
        ids.push(rows[i]["codigo_producto"]);
    }
    return ids;
  }


  // 2. Obtener cookie
  function getCookie() {
      var req = new Script.Util.HttpRequest("https://api.cruzverde.cl/customer-service/login");
      req.method = "POST";
      req.contentType = "application/json";
      req.postData = Platform.Function.Stringify({
          authType: "guest",
          customerId: "bcAIJUKQoxgRNkMTY3a9pllFxW",
          preferredLocale: "es_CL"
      });
      var resp = req.send();

      if (resp.statusCode > 299) {
          throw "Error login API: " + resp.statusCode;
      }

      var cookie = resp.getHeader("set-cookie");

      if (!cookie) {
          throw "No se obtuvo cookie";
      }

      return cookie;
  }
 
  // 3. Obtener productos API
  function getProducts(prodList, cookie) {
    var host = "https://api.cruzverde.cl/";
    var url =
      host +
      "product-service/products/product-summary?fields=name&fields=brand&fields=categoryId&fields=prices&fields=images&fields=stock&fields=promotions&fields=isBioequivalent&fields=bioequivalentSubCategoryId";
    var url = url + "&ids=" + prodList.join("&ids=") + "&ids=0";
    var req = new Script.Util.HttpRequest(url);
    req.emptyContentHandling = 0;
    req.retries = 2;
    req.continueOnError = true;
    req.method = "GET";
    req.setHeader("Cookie", cookie);

    var resp = req.send();
    var content = String(resp.content);
    var statusCode = String(resp.statusCode);

    if (statusCode == 200){
      return Platform.Function.ParseJSON(content);
    }
    else {
      return {}
    }
  }

  // 4. Upsert simple
  function upsertProduct(prodId, prod) {

    //Check if relevant key exist in JSON
    var isName = prod.hasOwnProperty("name") ? true : false;
    var isBrand = prod.hasOwnProperty("brand") ? true : false;
    var isRibbons = prod.hasOwnProperty("ribbons") ? true : false;
    var isPrices = prod.hasOwnProperty("prices") ? true : false;
    var isOffer = isPrices ? (prod["prices"].hasOwnProperty("price-sale-cl") ? true : false) : false;
    var isImages = prod.hasOwnProperty("images") ? true : false;
    var isImageOne = isImages ? (prod["images"][0] ? true : false) : false;
    var isCategory = prod.hasOwnProperty("categoryId") ? true : false;
    var isFormat = prod.hasOwnProperty("format") ? true : false;
    var isBioequivalent = prod.hasOwnProperty("isBioequivalent") ? true : false;
    var isBioCategory = prod.hasOwnProperty("bioequivalentSubCategoryId") ? true : false;

    var name = isName ? prod["name"] : undefined;
    var brand = isBrand ? prod["brand"].toLowerCase() : undefined;     
    var urlImage = isImageOne ? prod["images"][0]["disBaseLink"] : undefined;
    var urlPdp = isImageOne ? ("https://www.cruzverde.cl/" + urlImage.split("/").pop().split("-", 2).pop().replace(".jpg", "") + "/" + i + ".html") : undefined;
    var urlRibbons = isRibbons ? String(prod["ribbons"]) : undefined;
    var priceList = isPrices ? prod["prices"]["price-list-cl"] : undefined;
    var priceOffer = isOffer ? prod["prices"]["price-sale-cl"] : undefined;
    var category = isCategory ? prod["categoryId"] : undefined;
    var format = isFormat ? prod["format"] : undefined;
    var bioequivalent = isBioequivalent ? prod["isBioequivalent"] : undefined;
    var bioCategory = isBioCategory ? prod["bioequivalentSubCategoryId"] : undefined;
    var now = DateTime.SystemDateToLocalDate(Now());

    Platform.Function.UpsertData(
        TARGET_DE,
        ["codigo_producto"],
        [productId],
        [
          "descripcion",
          "marca",
          "formato",
          "categoria",
          "es_bioequivalente",
          "categoria_bioequivalente",
          "url_imagen",
          "url_pdp",
          "ur_ribbons",
          "precio_normal_cl",
          "precio_oferta_cl",
          "update"
        ],
        [
          name,
          brand,
          format,
          category,
          bioequivalent,
          bioCategory,
          urlImage,
          urlPdp,
          urlRibbons,
          priceList,
          priceOffer,
          now
        ]
    );
  }
 
  // MAIN
  try {
      var productIds = getProductIds();
      // Stringify
      var productIdsString = Platform.Function.Stringify(productIds);
      // Print en pantalla
      Write('<pre>' + productIdsString + '</pre>');
      // Print consola navegador -test
      Write('<script>console.log(' + productIdsString + ')</script>');

      if (productIds.length == 0) {
          throw "No hay productos en DE Source";
      }

      var cookie = getCookie();
      var products = getProducts(productIds, cookie);

      // Print en pantalla
      var cookieString = Platform.Function.Stringify(cookie);
      Write('<pre>' + cookieString + '</pre>');
      var productsString = Platform.Function.Stringify(products);
      Write('<pre>' + productsString + '</pre>');

      for (var i = 0; i < products.length; i++) {
          upsertProduct(i, products[i]);
      }

      Write("OK - " + products.length + " productos actualizados");

  } catch (e) {
      Write("ERROR: " + String(e));
  }

</script>