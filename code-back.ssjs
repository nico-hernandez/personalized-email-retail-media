<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Productos</title>
</head>
<body>
<script runat="server">
  Platform.Load("Core", "1.1.1");

  /* =========================================================
    Función que divide texto para evitar descriptores largos
  ========================================================= */
  function splitText(text) {
    var max = 24;
    var part1 = "";
    var part2 = "";

    // Caso 1: Texto nulo
    if (!text) {
      return "<br>";
    }

    // Caso 2: Texto corto
    if (text.length <= max) {
      part1 = text;
      return part1 + "<br>";
    } 

    // Caso 3: Texto largo
    var temp = text.substring(0, max);
    var lastSpace = temp.lastIndexOf(" ");

    if (lastSpace > 0) {
      part1 = temp.substring(0, lastSpace);
    } else {
      part1 = temp;
    }

    var rest = text.substring(part1.length); //text.substring(part1.length).trim();

    if (rest.length <= max) {
      part2 = rest;
    } else {
      part2 = rest.substring(0, max) + "...";
    }
    return part1 + "<br>" + part2;
  } 

  /* ===========================================================
    Función que deja en mayúscula la primera letra por palabra
  =========================================================== */
  function toTitleCaseIfUpper(str) {
    if (!str) return "";

    // Verifica si el string está completamente en mayúsculas
    if (str === str.toUpperCase()) {
      return str.toLowerCase().replace(/\b\w+\b/g, function(word) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      });
    }
    // Si no está completamente en uppercase, no modificar
    return str;
  }

  /* ===========================================================
    Función que formatea la URL para incluir UTM y tracking
  =========================================================== */
  function formatUrl(url){

    var today = new Date();
    today = today.getFullYear() + ("0" + (today.getMonth() + 1)).slice(-2) + ("0" + today.getDate()).slice(-2);
    var paramUnidadComercial = "bycp";
    var paramLineaEstrategica = "RMedia-Dermosolares";
    var paramNombreCampana = "Anthelios-LRP";
    var paramUtmSource = "salesforce";
    var paramUtmMedium = "email";
    var paramUtmContent = "home-cv";
    var suffix = [today, paramUnidadComercial, paramLineaEstrategica, paramNombreCampana].join("_");
    var paramsUrl = {
      utm_source: paramUtmSource,
      utm_medium: paramUtmMedium,
      utm_content: paramUtmContent,
      utm_campaign: "fcv_crm_" + suffix
    };
    var pairs = [];
    for (var prop in paramsUrl) {
        if (paramsUrl.hasOwnProperty(prop)) {
            pairs.push(prop + "=" + paramsUrl[prop]);
        }
    }
    var str = url + "?" + pairs.join("&");
    return str;
  }
  /* =========================================================
    Main que consulta atributos del producto a mostrar en HTML
  ========================================================= */
  try {
    var productList = ["273358", "545055", "259654", "276432", "391647", "277072"];
    var dataExtension = "ProductDetail - Test";
    var productDetails = [];

    for (var i = 0; i < productList.length; i++) {
      var codigo = productList[i];
      var rows = Platform.Function.LookupRows(dataExtension, ["codigo_producto"], [codigo]);
      var row = (rows && rows.length > 0) ? rows[0] : null;

      if (row) {
        // Casos bordes de los campos de interes
        var esOferta = row["precio_oferta_cl"] ? true : false;
        var descripcion = splitText(toTitleCaseIfUpper(row["descripcion"]));
        var precioNormal = row["precio_normal_cl"] || 9999999;
        var precioOferta = row["precio_oferta_cl"] || row["precio_normal_cl"];
        var descuento = Math.round(((precioNormal - precioOferta) / precioNormal) * 100);
        var imagen = row["url_imagen"] || "https://image.mailcruzverde.cl/lib/fe3615717564047b711178/m/1/70239c1d-2dac-4c6a-af85-fb4336152eac.png";
        var pdp = row["url_pdp"] ? formatUrl(row["url_pdp"]) : formatUrl("https://www.cruzverde.cl/");
        var valorOculto = esOferta ? "" : " visibility:hidden; mso-hide:all;";
        
        //Formatear para mostrar en HTML
        precioNormal = "$" + String(precioNormal).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        precioOferta = "$" + String(precioOferta).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        descuento = "-" + descuento + "%";

        productDetails.push({
          index: i + 1,
          status: "encontrado",
          codigo: row["codigo_producto"],
          descripcion: descripcion,
          marca: row["marca"],
          precioNormal: precioNormal,
          precioOferta: precioOferta,
          esOferta: esOferta,
          descuento: descuento,
          imagen: imagen,
          pdp: pdp,
          valorOculto: valorOculto
        });

      } else {

        productDetails.push({
          index: i + 1,
          status: "no encontrado",
          codigo: codigo,
          descripcion: "",
          marca: "",
          precioNormal: "",
          precioOferta: "",
          esOferta: false,
          descuento: "",
          imagen: "",
          pdp: ""
        });

      }
    }

    // Stringify
    var productDetailsString = Platform.Function.Stringify(productDetails);

    // Print en pantalla
    // Write('<pre>' + productDetailsString + '</pre>');

    // Print consola navegador
    Write('<script>console.log(' + productDetailsString + ')</script>');

    // Pasar a AMPscript
    Variable.SetValue("@productDetailsString", productDetailsString);

  } catch (ex) {
    Write("Ocurrió un error: " + String(ex));
  }
</script>

  %%[
    SET @productDetailsRows = BuildRowsetFromJSON(@productDetailsString, "$[*]", 1)
  ]%%

  <p>
    %%=v(Field(Row(@productDetailsRows, 2), "codigo"))=%%
    %%=v(Field(Row(@productDetailsRows, 2), "precioNormal"))=%%
    %%=v(Field(Row(@productDetailsRows, 2), "descuento"))=%%
  </p>
</body>
</html>