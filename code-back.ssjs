
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Productos</title>
</head>
<body>

<script runat="server">
  Platform.Load("Core", "1.1.1");

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
          var dcto = ((row["precio_normal_cl"] - row["precio_oferta_cl"]) / row["precio_normal_cl"]) * 100;
          dcto = Math.round(dcto);
        } else {
          var dcto = 0;
        }

        productDetails.push({
          index: i + 1,
          status: "encontrado",
          codigo: row["codigo_producto"],
          descripcion: row["descripcion"],
          marca: row["marca"],
          precio_normal: row["precio_normal_cl"],
          precio_oferta: row["precio_oferta_cl"],
          descuento: dcto,
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
    Write('<pre>' + productDetailsString + '</pre>');

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
  %%=v(Field(Row(@productDetailsRows, 1), "codigo"))=%%
  $%%=v(Field(Row(@productDetailsRows, 1), "precio_normal"))=%%
  %%=v(Field(Row(@productDetailsRows, 1), "dcto"))=%%
</p>

</body>
</html>