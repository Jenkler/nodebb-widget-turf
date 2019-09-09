<h1>Turf</h1>
<form>
  <p>A widget that shows your turf user list</p><br/>
  <p>
    <label for="users">Turf users</label>
    <input class="form-control" data-field="turf:users" placeholder="Comma separated list of users" title="users" type="text"><br/>
  </p>
</form>

<button class="btn btn-lg btn-primary" id="save">Save</button>

<script>
  require(['admin/settings'], function(Settings) {
    Settings.prepare();
  });
</script>
