import unittest
import sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from tools.public_review_full_queue import queue

def sample(cid, status="Needs review", parallel="", number="42", player="One",
           team="A", name="2026 Topps - Base Set"):
    return {
       "id":cid, "review_status":status, "identity_unconfirmed":status!="Verified",
       "sport":"Football","year":"2026","brand":"Topps","set":name,
       "number":number,"player":player,"team":team,"parallel":parallel,
       "image":"assets/"+cid+".jpg",
    }

class FullReviewCoverageTests(unittest.TestCase):
    def test_duplicate_first_and_every_pending_once(self):
        cards=[sample("a"),sample("b"),sample("c",player="Another")]
        rows=queue(cards)
        self.assertEqual(len(rows),3)
        self.assertEqual(len(set(r["public_id"] for r in rows)),3)
        self.assertEqual([x["tier"] for x in rows],
           ["DUPLICATE_FIRST","DUPLICATE_FIRST","SINGLE_STANDARD_REVIEW"])
    def test_parallel_separated_from_standard(self):
        cards=[sample("a"),sample("b",parallel="Blue")]
        rows=queue(cards)
        self.assertTrue(all(r["tier"]=="SINGLE_SPECIAL_REVIEW" for r in rows))
        self.assertTrue(all("MULTIPLE_PARALLELS_SAME_NUMBER" in r["risk_flags"] for r in rows))
    def test_verified_not_in_pending(self):
        cards=[sample("a","Verified"),sample("b")]
        rows=queue(cards)
        self.assertEqual(len(rows),1)
        self.assertEqual(rows[0]["public_id"],"b")
    def test_foil_and_relic_are_high_risk(self):
        cards=[sample("a",name="Base Memorabilia",number="42"),
               sample("b",parallel="Rainbow Foil",number="43")]
        rows=queue(cards)
        self.assertEqual(len(rows),2)
        self.assertTrue(all(r["tier"]=="SINGLE_SPECIAL_REVIEW" for r in rows))
    def test_no_autoapproval(self):
        cards=[sample("a")]
        rows=queue(cards)
        self.assertEqual(rows[0]["approval_status"],"NOT_APPROVED__AUTHORITATIVE_LAN_REVIEW_ONLY")

if __name__=="__main__":unittest.main()
