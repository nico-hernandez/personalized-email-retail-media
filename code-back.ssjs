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
/*     function splitText(text) {
      var max = 24;
      var part1 = "";
      var part2 = "";

      // Caso 1: Texto nulo
      if (!text) {
        return "zzz";
      }

      // Caso 2: Texto corto
      if (text.length <= max) {
        part1 = text;
        return part1 + "zzz";
      } 

      // Caso 3: Texto largo
      var temp = text.substring(0, max);
      var lastSpace = temp.lastIndexOf(" ");

      if (lastSpace > 0) {
        part1 = temp.substring(0, lastSpace);
      } else {
        part1 = temp;
      }

      var rest = text.substring(part1.length).trim();

      if (rest.length <= max) {
        part2 = rest;
      } else {
        part2 = rest.substring(0, max) + "...";
      }
      return part1 + "zzz" + part2;
    } 
 */

 function splitText(text) {
  var x = text.length;
  var y = text.substring(0, 24);
  return x + y;
 }
    /* =========================================================
      Main que consulta atributos del producto a mostrar en HTML
    ========================================================= */
    try {
      var productList = [
        "273358",
        "545055",
        "546661",
        "383877",
        "259654",
        "574372"
      ];

      var dataExtension = "ProductDetail";
      var productDetails = [];

      for (var i = 0; i < productList.length; i++) {
        var code = productList[i];
        var rows = Platform.Function.LookupRows(dataExtension, ["codigo_producto"], [code]);
        var row = (rows && rows.length > 0) ? rows[0] : null;

        if (row) {

          if (row["precio_normal_cl"] > 0 && row["precio_oferta_cl"] >= 0) {
            var descuento = "-" + Math.round(((row["precio_normal_cl"] - row["precio_oferta_cl"]) / row["precio_normal_cl"]) * 100) + "%";
            var precio_normal = "$" + String(row["precio_normal_cl"] ).replace(/\B(?=(\d{3})+(?!\d))/g, ".")
            var precio_oferta = "$" + String(row["precio_oferta_cl"] ).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
          } else {
            var descuento = 0;
          }
          var descripcion = splitText("Protector Solar Facial Gel Crema Oil Control FPS 50+ 50ml");

          productDetails.push({
            index: i + 1,
            status: "encontrado",
            codigo: row["codigo_producto"],
            descripcion: descripcion,
            marca: row["marca"],
            precio_normal: precio_normal,
            precio_oferta: precio_oferta,
            descuento: descuento,
            imagen: row["url_imagen"],
            pdp: row["url_pdp"]
          });

        } else {

          productDetails.push({
            index: i + 1,
            status: "no encontrado",
            codigo: code,
            descripcion: "",
            marca: "",
            precio_normal: 0,
            precio_oferta: 0,
            descuento: 0,
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
    %%=v(Field(Row(@productDetailsRows, 2), "precio_normal"))=%%
    %%=v(Field(Row(@productDetailsRows, 2), "descuento"))=%%
  </p>
</body>
</html>