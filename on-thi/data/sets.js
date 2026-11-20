/* Danh sách bộ đề. Thêm bộ mới: tạo data/<id>.js (window.ONTHI_SETS.push({...})) rồi thêm id vào mảng dưới. Bộ cuối cùng là bộ mặc định. */
["hn4-15-25"].forEach(function(id){ document.write('<script src="data/' + id + '.js"><\/script>'); });
